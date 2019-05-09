from graphene import Schema
from .queries import Queries
from .mutations import Mutations

itemSchema = Schema(query=Queries, mutation=Mutations)

__all__ = ['itemSchema']
