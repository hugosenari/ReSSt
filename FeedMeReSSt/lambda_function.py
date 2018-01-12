import os, json, boto3, feedparser, traceback
from botocore.exceptions import ClientError
from datetime import datetime
from boto3.dynamodb.conditions import Attr
from uuid import uuid5, NAMESPACE_URL
from decimal import Decimal
from functools import singledispatch

TABLE_ENV_VAR_NAME = 'ReSStCRUD_TABLE'
DEFAULT_TABLE_NAME = 'ReSSt'
ROOT = 'root'
INDEX_NAME = 'feeds'
A_DAY = 60 * 60 * 24
now = lambda: int(datetime.now().timestamp())

TABLE_NAME = os.environ.get(TABLE_ENV_VAR_NAME, DEFAULT_TABLE_NAME)

@singledispatch
def serializer(obj):
    print("Can serialize type {}".format(type(obj)))
    return ""

@serializer.register(Decimal)
def _serializer(obj):
    return int(obj)

def find_more_sources(table, next_token=None):
    filexp=Attr('xmlUrl').exists()

    args = { 'FilterExpression': filexp }
    if INDEX_NAME:
        args['IndexName'] = INDEX_NAME
    if next_token:
        args['ExclusiveStartKey'] = next_token
    result = table.scan(**args)
    print('Feeds len ', len(result['Items']))
    return result

def read_sources(lambida, event):
    lambida.invoke(
        FunctionName="feedMeReSSt",
        InvocationType='Event',
        Payload=json.dumps(event, default=serializer)
    )

def read_source(source):
    url = source['xmlUrl']
    feed = feedparser.parse(url)
    items = list(feed.get('items', []))
    print('{} Importing {} items from {}'.format(str(datetime.now()), len(items), url))
    for item in items:
        item['parent'] = source['uid']
        yield item

def set_uid(items):
    for item in items:
        payload = item.get('id') or item.get('link')
        item['uid'] = uuid5(NAMESPACE_URL, payload).hex
        yield item

def filter_attrs(item):
    keys = ['id', 'title', 'link', 'summary', 'credit', 'author', 'published']
    result = { k: item.get(k) or ' ' for k in keys }
    result['imported_at'] = now()
    result['unread_since'] = now()
    result['live_until'] = now() + (A_DAY * 30)
    contents = item.get('content') or []
    result['content'] = [
        content.get('value') or ' ' for content in contents
        if content != result.get('summary') 
    ]
    medias = item.get('media_content') or []
    result['media_content'] = [media.get('value') or ' ' for media in medias]
    return result

def save_item(table, item):
    i = filter_attrs(item)
    try:
        exps = ['{0} = if_not_exists({0}, :{0})'.format(k) for k in i.keys()]
        upExp = 'SET ' + ','.join(exps)
        exAttVal = { ':' + k : v for k, v in i.items() }
        key = {'uid': item['uid'], 'parent': item['parent']}
        table.update_item(Key=key, UpdateExpression=upExp,
            ExpressionAttributeValues= exAttVal)
        return item
    except ClientError as e:
        if e.response['Error']['Code'] != 'ConditionalCheckFailedException':
            print('Failed to put ', i)
            print(traceback.format_exception(None, e, e.__traceback__))

def save_items(table, items):
    for item in set_uid(items):
        if save_item(table, item):
            yield item

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    sources = event.get('xmlUrls') or []
    next_token = event.get('next_token')
    table = dynamodb.Table(TABLE_NAME)
    if sources:
        source = sources.pop()
        items = read_source(source)
        saved = save_items(table, items)
        size = len(list(saved))
        time = str(datetime.now())
        url = source.get('xmlUrl')
        print('{} Imported {} items from {}'.format(time, size, url))
    else:
        result = find_more_sources(table, next_token)
        sources = result['Items']
        next_token = result.get('LastEvaluatedKey')

    if sources or next_token:
        service = boto3.client('lambda')
        read_sources(service, {
            'xmlUrls': sources,
            'next_token': next_token
        })
    else:
        print('Imported all sources')
    return sources
