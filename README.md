ReSSt
=====

RSS API based on AWS Lambda, Dynamodb, Api Gateway and Python

This aplicatoion uses 3 levels:

1. Categories (parent = 'root');
2. Feeds (parent = category id);
3. Item (parent = feed id);


AWS Lambda Functions:
---------------------

- FeedMeReSSt:  
  CRON that read RSS sources from time to time.

- ReSStCRUD:  
  API for RSS/OPML item.

- ReSStOPMLImport:  
  API to import sources from OPML xml file.


ReSStUI:
--------

Static user interface (WIP).

It can be hosted by Github Pages.

https://hugosenari.github.io/ReSSt/ReSStUI/


DynamoDB Tables:
----------------

- ReSSt:  
  uid, parent: RSS items/sources.


DynamoDB Index:
---------------

- parent:   
  parent, imported_at: because most of search is parent based.

- feeds:  
  xmlUrl, parent: list all feed sources.

- unread:  
  unread_since, parent: has only unread items.


API:
====

/ReSStOPMLImport
----------------

Import feed sources from OPML file

- POST  
  Expect OPML xml in body.


/ReSStCRUD
----------

CRUD operations for sources/items

- GET  
  list sources or items
  Expected query params to filter by:
  - uid=string, show an item/source by uid;
  - parent=string, scan item/source childs by uid;
  - last=string, uid of last item found to paginate;
  - tree=string, make a tree of item/source by uid;
  - title=string, scan by item/source title;
  - link=string, scan by item link;
  - xmlUr=string, scan by source url;
  - star=var, show stared items only;
  - read=var, show read items only;
  - unread=var, show unread items only, can be used with other params;
  - date=int, shows 24h before timestamp in seconds, can be used with other params.  

- PUT  
  Insert category, feed or item.
  Expects json with category, feed or item in body.

- POST  
  Update item category, feed or item.
  Expects json with category, feed or item in body with on of:
  - uid: uid of item to update;
  - parentUid: uid of parent to update items;
  - uids: list of uid to update.

- PATCH  
  Set item category, feed or item as read.
  Expects json with one of:
  - uid: uid of item to update;
  - parentUid: uid of parent to update items;
  - uids: list of uid to update;
  - unread: set to unread.

- DELETE  
  Delete source or item.
  Expects json with 'uid' of source or item.


Install:
--------

Since it does't have CloudFormation file yet, is not easy install it on AWS.
Good look!

- Create three python3 functions:
    - Two for api gateway (ReSStCRUD, ReSStOPMLImport).
    - One for cloudwatch (FeedMeReSSt).
- Create one DynamoDB table (ReSSt).
- Create three index (parent, feeds, unread).
- Publish ou api and create a API-KEY.
- Upload ReSStUI to somewhere.


Todo:
-----

- Fix *TODO* in this README;
- Fix security issues;
- Convert to servless/chalice;
- Add suport to multi user;
- make all this ugly code pretty;
