import resolvers

from schemas import Item
from graphene import \
    Argument, ObjectType, String, ID, Int, Field, List, Schema, Boolean
from graphene.types.json import JSONString

def item_from(obj):
    result = None
    if obj:
        kwd = dict(obj.items())
        result = Item(**kwd)
    return result


class ItemQuery(ObjectType):
    by_uid = Field(Item, uid=ID())
    by_parent = List(Item, uid=ID())

    def resolve_by_uid(self, info, uid):
        items = resolvers.by_uid(uid)
        return items and item_from(items[0]) or None

    def resolve_by_parent(self, info, uid, unread=True, limit=40):
        items = resolvers.by_parent(uid, unread=unread, limit=limit)
        return (item_from(obj) for obj in items)


item = Schema(query=ItemQuery)

__all__ = ['ItemQuery', 'item']
