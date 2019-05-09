from .resolvers import set_as_read
from .logger import logger
from .types import Item
from graphene import \
    Argument, ObjectType, ID, List, Boolean, Mutation


def item_from(obj, of=Item):
    if obj:
        kwd = dict(obj)
        return of(**kwd)


def items_from(objs, of=Item):
    for obj in objs:
        yield item_from(obj, of)


class MarkAsRead(Mutation):
    class Arguments:
        uids = List(ID)
        read = Boolean()

    results = List(Item)

    @staticmethod
    def mutate(root, info, uids, read=True):
        logger.info(f'Updating {uids} as {"read" if read else "unread"}')
        return MarkAsRead(results=items_from(set_as_read(uids, read=read)))

class Mutations(ObjectType):
    mark_as_read = MarkAsRead.Field()


__all__ = ['Mutations']
