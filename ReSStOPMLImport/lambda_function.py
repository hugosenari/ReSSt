from boto3.dynamodb.conditions import Attr, Key
import xml.etree.ElementTree as etree
from datetime import datetime
from functools import singledispatch
from uuid import uuid5, NAMESPACE_URL
import os, boto3, json, traceback


TABLE_ENV_VAR_NAME = 'ReSStCRUD_TABLE'
DEFAULT_TABLE_NAME = 'ReSSt'
ROOT = 'root'
now = lambda: int(datetime.now().timestamp())

resp = lambda body, code='200': {
    'statusCode': code,
    'body': json.dumps(body),
    'headers': {'Content-Type': 'application/json'},
}

err2body = lambda err: {
    'type': type(err).__name__,
    'args': err.args
}

@singledispatch
def respond(res):
    return resp(res)

err_codes = {
    ValueError: "400"
}

@respond.register(Exception)
def _respond(err):
    print(traceback.format_exception(None, err, err.__traceback__))
    return resp(err2body(err), err_codes.get(type(err), '500'))

def saver():
    TABLE_NAME = os.environ.get(TABLE_ENV_VAR_NAME, DEFAULT_TABLE_NAME)
    table = boto3.resource('dynamodb').Table(TABLE_NAME)
    def save(**x):
        payload = x.get('xmlUrl') or x.get('title')
        nuid = uuid5(NAMESPACE_URL, payload).hex
        if not x.get('htmlUrl'):
            del x['htmlUrl']
        if not x.get('xmlUrl'):
            del x['xmlUrl']
        items = table.query(KeyConditionExpression=Key('uid').eq(nuid),
                    ProjectionExpression='uid')['Items']
        if not items:
            table.put_item(Item=x)
            return x['uid']
        else:
            x = items[0]
    return save


def save_childs(parent, save, parentId='root'):
    imports = 0
    ignored = 0
    for child in parent.iterfind('outline'):
        attrib = child.attrib
        valid = 'text' in attrib or 'xmlUrl' in attrib
        if valid:
            payload = attrib.get('xmlUrl') or attrib.get('text')
            nuid = uuid5(NAMESPACE_URL, payload).hex
            uid = save(
                uid=nuid,
                parent=parentId,
                title=attrib.get('text'),
                xmlUrl=attrib.get('xmlUrl'),
                htmlUrl=attrib.get('htmlUrl'),
                imported_at=now()
            )
            imported = 1 if nuid == uid else 0
            not_imported = 1 if nuid != uid else 0
            (ii, ni) = save_childs(child, save, uid)
            imports = imports + imported + ii
            ignored = ignored + not_imported + ni
    return imports, ignored

def import_opml(event):
    opml = etree.fromstring(event.get('body'))
    body = opml.find('body')
    save = saver()
    (imported, ignored) = save_childs(body, save)
    return {'imported': imported, 'ignored': ignored}

def lambda_handler(event, context):
    try:
        method = event.get('httpMethod')
        if method == 'POST':
            return respond(import_opml(event))
    except Exception as err:
        return respond(err)
    return respond(ValueError('Unsupported method "{}"'.format(method)))
