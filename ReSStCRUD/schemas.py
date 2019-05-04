from graphene import ObjectType, String, ID, Int, Field, List, Schema
from uuid import uuid5, NAMESPACE_URL


class Item(ObjectType):
    author = String()
    content = String()
    credit = String()
    id = String()
    imported_at = Int()
    link = String()
    live_until = Int()
    media_content = String()
    parent = String()
    published = String()
    readed_at = Int()
    summary = String()
    title = String()
    uid = ID(required=True)
    unread_since = Int()
    updated = String()

    def resolve_uid(self, info):
        payload = self.id or self.link or ''
        return uuid5(NAMESPACE_URL, payload).hex


__all__ = ['Item']
