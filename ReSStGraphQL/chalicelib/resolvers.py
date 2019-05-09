import os
import boto3

from boto3.dynamodb.conditions import Key, Attr
from functools import lru_cache
from datetime import datetime
from .logger import logger


AS_READ = '''REMOVE unread_since
    SET readed_at = if_not_exists(readed_at, :_now),
        live_until = :_live_until'''

AS_UNREAD = '''REMOVE readed_at
    SET unread_since = if_not_exists(unread_since, :_now),
        live_until = :_live_until'''

A_DAY = 60 * 60 * 24

@lru_cache()
def table_name():
    DEFAULT_TABLE_NAME = 'ReSSt'
    TABLE_ENV_VAR_NAME = 'ReSStCRUD_TABLE'
    return os.environ.get(TABLE_ENV_VAR_NAME, DEFAULT_TABLE_NAME)

@lru_cache()
def std_table(name=table_name, dynamodb=boto3.resource('dynamodb')):
    return dynamodb.Table(name())

def get_items(of):
    items = of.get('Items', [])
    return items or []

def by_uids(uids, table=std_table):
    logger.info(f'by_uids {uids}')
    for uid in uids:
        result = table().query(KeyConditionExpression=Key('uid').eq(uid))
        yield from get_items(result)

def by_parents(uids, unread=True, limit=40, table=std_table):
    index_name = unread and 'unread' or 'parent'
    for uid in uids:
        result = table().query(
            Limit=limit,
            IndexName=index_name,
            KeyConditionExpression=Key('parent').eq(uid)
        )
        yield from get_items(result)

def now():
   return int(datetime.now().timestamp())

def set_as_read(uids, read=True, days=30, table=std_table):
    logger.info(f'set_as_read {uids}')
    for item in by_uids(uids):
        table().update_item(
            Key={ 'uid': item['uid'], 'parent': item['parent'] },
            UpdateExpression=AS_READ if read else AS_UNREAD,
            ExpressionAttributeValues={
                ':_now': now(),
                ':_live_until': now() + (A_DAY * days)
            }
        )
        item['live_until'] = now() + (A_DAY * days)
        if read:
           if not item.get('readed_at'):
               item['readed_at'] = now()
           if item.get('unread_since'):
               del item['unread_since']
        else:
           if not item.get('unread_since'):
               item['unread_since'] = now()
           if item.get('readed_at'):
               del item['readed_at']
        yield item
