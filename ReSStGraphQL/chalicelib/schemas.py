from graphene import ObjectType, Interface, String, ID, Int, Field, List, Schema
from uuid import uuid5, NAMESPACE_URL


class Record(Interface):
    uid = ID(required=True)
    parent = String()
    title = String()
    imported_at = Int()


class Category(ObjectType):
    class Meta:
        interfaces = (Record, )

    xmlUrl = String()
    htmlUrl = String()

    def resolve_uid(self, info):
        payload = self.xmlUrl or self.text or ''
        return uuid5(NAMESPACE_URL, payload).hex


class Item(ObjectType):
    class Meta:
        interfaces = (Record, )

    author = String()
    content = String()
    credit = String()
    id = String()
    link = String()
    live_until = Int()
    media_content = String()
    published = String()
    readed_at = Int()
    summary = String()
    uid = ID(required=True)
    unread_since = Int()
    updated = String()

    def resolve_uid(self, info):
        payload = self.id or self.link or ''
        return uuid5(NAMESPACE_URL, payload).hex


__all__ = ['Record','Item', 'Category']
