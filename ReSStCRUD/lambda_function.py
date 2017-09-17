from boto3.dynamodb.conditions import Attr, Key
from datetime import datetime
from functools import singledispatch
from uuid import uuid5, NAMESPACE_URL
from decimal import Decimal
import os, boto3, json, traceback

TABLE_ENV_VAR_NAME = 'ReSStCRUD_TABLE'
DEFAULT_TABLE_NAME = 'ReSSt'
UNREAD_INDEX = 'unread'
FEEDS_INDEX = 'feeds'
PARENT_INDEX = 'parent'
ROOT = 'root'
A_DAY = 60 * 60 * 24
now = lambda: int(datetime.now().timestamp())

@singledispatch
def serializer(obj):
    return "unkonw type {}".format(type(obj))

@serializer.register(Decimal)
def _serializer(obj):
    return int(obj)

resp = lambda body, code='200': {
    'statusCode': code,
    'body': json.dumps(body, default=serializer),
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
}

err2body = lambda err: {
    'type': type(err).__name__,
    'args': err.args
}

@singledispatch
def respond(res):
    return resp(res)

err_codes = { ValueError: '400' }

@respond.register(Exception)
def _respond(err):
    print(traceback.format_exception(None, err, err.__traceback__))
    return resp(err2body(err), err_codes.get(type(err), '500'))


class Subscriptable:
    DEFAULT = None
    @classmethod
    def __getitem__(cls, key):
        return cls.get(key)

    @classmethod
    def get(cls, key, default=None):
        return getattr(cls, key or '', default or cls.DEFAULT)


class By(Subscriptable):
    _unread = lambda x, f: f & By.unread(x) if 'unread' in x else f
    _day    = lambda x, f: f & By.date(x) if 'date' in x else f
    _un_day = lambda x, f: By._unread(x, By._day(x, f))
    key     = lambda x, key: Key(key).eq(x[key])
    unread  = lambda x: By._day(x, Attr('unread_since').exists())
    read    = lambda x: By._day(x, Attr('readed_at').exists())
    star    = lambda x: By._day(x, Attr('stared').exists())
    parent  = lambda x: By._un_day(x, Attr('parent').eq(x.get('parent') or ROOT))
    title   = lambda x: By._un_day(x, Attr('title').contains(x['title']))
    link    = lambda x: By._un_day(x, Attr('link').eq(x['link']))
    text    = lambda x: By._un_day(x, Attr('text').contains(x['text']))
    xmlUrl  = lambda x: By._un_day(x, Attr('xmlUrl').eq(x['xmlUrl']))
    date    = lambda x: By._unread(x, Attr('imported_at').between(
        x.get('date', now()) - A_DAY, x.get('date', now())
    ))
    DEFAULT = parent

def params(x, filex=None, key=None, last=None):
    result = { }
    if last:
        result['ExclusiveStartKey'] = last
    if key:
        if key == 'parent' and not x.get(key):
            x[key] = ROOT
        if not x.get(key):
            raise ValueError('missing parameter "{}"'.format(key))
        result['KeyConditionExpression'] = By.key(x, key)
    if filex:
        result['FilterExpression'] = filex
    if 'parent' in x and (key == 'parent' or not key):
        result['IndexName'] = PARENT_INDEX
    if 'xmlUrl' in x or 'feeds' in x\
        and (key == 'xmlUrl' or not key):
        result['IndexName'] = FEEDS_INDEX
    if 'unread' in x and (key == 'unread_since' or not key):
        result['IndexName'] = UNREAD_INDEX
    return result

class ScanBy(Subscriptable):
    parent = lambda x, T: T.query(**params(x, key='parent'))
    uid    = lambda x, T: T.query(**params(x, key='uid'))
    tree   = lambda x, T: ScanBy._tree(x.get('tree') or ROOT, T)
    DEFAULT = parent

    @classmethod
    def get(cls, key, default=None):
        attr = getattr(cls, key or '', default)
        filex = By.get(key)
        scan = lambda x, T: T.scan(**params(x, filex(x)))
        return attr or scan

    @classmethod
    def _tree(cls, parent=ROOT, table=None, current_depth=0, max_depth=1):
        result = ScanBy.parent({'parent': parent or ROOT}, table)
        if current_depth < max_depth:
            for item in result['Items']:
                item['Items'] = cls._tree(item['uid'], table, 
                                          current_depth+1, max_depth)['Items']
        return result

    @staticmethod
    def get_by(unread=None, date=None, **data):
        keys = data.keys()
        if keys:
            return ScanBy.get(next(iter(keys)))
        if date:
            return ScanBy.get('date')
        if unread:
            return ScanBy.get('unread')
        return ScanBy.get('parent')


class UpdateTo(Subscriptable):
    read = lambda x, T: False
    unread = lambda x, T: False
    star = lambda x, T: False


class Paginator:
    def __init__(self, operation, x, table):
        self.operation = operation
        self.params = x
        self.table = table

    def __iter__(self):
        result = {}
        while result.get('LastEvaluatedKey') or 'Items' not in result:
            self.params['last'] = result.get('LastEvaluatedKey')
            result = self.operation(self.params, self.table)
            yield result


def all_items(parent, table):
    if parent:
        for page in Paginator(ScanBy.parent, {'parent': parent}, table):
            for item in page['Items']:
                yield item


class Operation(Subscriptable):
    DELETE = lambda x, T: Operation._del(T, x.get('uid'))
    GET =    lambda x, T: ScanBy.get_by(**x)(x, T)
    PUT =    lambda x, T: Operation._update(table=T, **x)
    PATCH =  lambda x, T: Operation._as_read(table=T, **x)
    POST =   lambda x, T: T.put_item(
        Item=dict(
            parent=x.pop('parent', ROOT),
            uid=Operation.uid(x.get('id'), **x),
            **x))
    DEFAULT = GET

    @staticmethod
    def uid(mid=None, xmlUrl=None, link=None, title=None, **data):
        return uuid5(NAMESPACE_URL, mid or xmlUrl or link or title).hex


    @classmethod
    def _do_update(cls, method, table=None, uid=None, parentUid=None,
        uids=set(), **data):
        ids = {uid} if uid else set()
        ids += set(uids) if uids else set()
        ids += set(i['uid'] for i in all_items(parentUid, table))
        if not ids:
            raise ValueError('Undefined uid/uids/parentUid')
        cls._update_method(table, **data)
        result = []
        for _id in uids:
            result += [method(_id)]
        return dict(uid=uid, parentUid=parentUid, uids=uids, result=result)

    @classmethod
    def _update(cls, table=None, uid=None, parentUid=None, uids=set(), **data):
        sets, values = [], {}
        for k, v in data.items():
            placeholder = ':_{}'.format(k)
            sets.append('{} = {}'.format(k), placeholder)
            values[placeholder] = v
        upex = 'SET {}'.format(','.join(sets))
        def method(uid):
            return table.update_item(Key={ 'uid': uid },
                ExpressionAttributeValues=values,
                UpdateExpression=upex)
        return cls._do_update(
            table=table, uid=uid, parentUid=parentUid, uids=uids, **data)

    @classmethod
    def _as_read(cls, table=None, uid=None, parentUid=None, uids=set(), unread=None, **data):
        readUpEx = '''REMOVE unread_since,
                  SET readed_at = if_not_exists(readed_at, :_now)'''
        unreadUpEx = '''REMOVE readed_at,
                  SET unread_since = if_not_exists(unread_since, :_now)'''
        upEx = unreadUpEx if unread else readUpEx
        values = {':_now': now()}
        def method(uid):
            return table.update_item(Key={ 'uid': uid },
                ExpressionAttributeValues=values,
                UpdateExpression=upEx)
        return cls._do_update(
            table=table, uid=uid, parentUid=parentUid, uids=uids, **data)

    @classmethod
    def _del(cls, table, uid=None, parent=None):
        if not uid:
            return ValueError('uid is undefined')
        if not parent:
            me = ScanBy.uid({'uid': uid}, table)['Items']
            parent = me[0]['parent'] if me else parent
        if parent:
            table.delete_item(Key=dict(uid=uid, parent=parent))
        result = []
        for item in all_items(uid, table):
            result += [cls._del(table, uid=item['uid'], parent=item['parent'])]
        return dict(uid=uid, parent=parent, Items=result)


class Handle:
    TABLE_NAME = os.environ.get(TABLE_ENV_VAR_NAME, DEFAULT_TABLE_NAME)

    def __init__(self, event):
        self.method = event.get('httpMethod')
        self.params = event.get('queryStringParameters')
        self.body =   event.get('body') or '{}'
        self.operation = Operation.get(self.method)

    @property
    def payload(self):
        return self.params or {} if self.method == 'GET' \
            else json.loads(self.body)

    @property
    def handle(self):
        if self.operation:
            try:
                table = boto3.resource('dynamodb').Table(self.TABLE_NAME)
                return self.operation(self.payload, table)
            except Exception as err:
                return err
        return ValueError('Unsupported method "{}"'.format(self.method))


def lambda_handler(event, context):
    return respond(Handle(event).handle)
