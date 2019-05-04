import os
import boto3

from boto3.dynamodb.conditions import Key, Attr
from functools import lru_cache

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

@lru_cache()
def by_uid(uid, table=std_table):
    result = table().query(KeyConditionExpression=Key('uid').eq(uid))
    return get_items(result)

@lru_cache()
def by_parent(uid, unread=True, limit=40, table=std_table):
    index_name = unread and 'unread' or 'parent'
    result = table().query(
        Limit=limit,
        IndexName=index_name,
        KeyConditionExpression=Key('parent').eq(uid)
    )
    return get_items(result)
