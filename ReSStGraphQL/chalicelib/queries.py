from .logger import logger
from .resolvers import by_parents, by_uids
from .schemas import Item, Category
from graphene import \
    Argument, ObjectType, String, ID, Int, Field, List, Schema, Boolean
from graphene.types.json import JSONString


def item_from(obj, of=Item):
    if obj:
        kwd = dict(obj)
        return of(**kwd)


def items_from(objs, of=Item):
    for obj in objs:
        yield item_from(obj, of)


class Queries(ObjectType):
    items = List(Item, uids=List(ID))
    items_by_parents = List(Item, uids=List(ID),
        unread=Boolean(default_value=True), limit=Int(default_value=40))
    categories = Field(Category, uids=List(ID))
    categories_by_parents = List(Category, uids=List(ID),
        limit=Int(default_value=40))

    def resolve_items(self, info, uids):
        logger.info(f'resolve uids {uids}')
        objs = by_uids(uids)
        yield from items_from(objs)

    def resolve_items_by_parent(self, info, uids, unread=True, limit=40):
        objs = by_parents(uids, unread=unread, limit=limit)
        yield from items_from(objs)

    def resolve_categories(self, info, uids):
        objs = by_uids(uids)
        yield from items_from(objs, of=Category)

    def resolve_categories_by_parent(self, info, uids, limit=40):
        objs = by_parents(uids, unread=False, limit=limit)
        yield from items_from(objs, of=Category)


itemQuery = Schema(query=Queries)

__all__ = ['Queries', 'itemQuery']
