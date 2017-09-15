ReSSt
=====

RSS API based on AWS Lambda, Dynamodb, Api Gateway and Python


Functions:
----------

- FeedMeReSSt:  
  CRON that read RSS sources from time to time.

- ReSStCRUD *WIP*:  
  API for RSS/OPML item.

- ReSStOPMLImport:  
  API to import sources from OPML xml file.

- ReSStUI *TODO*:
  User interface.


Tables:
-------

- ReSSt:  
  uid, parent: RSS items/sources.


Index:
------

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
  Ipdate source/item.
  Expects json with category, feed or item in body with on of:
  - uid: uid of item to update;
  - parentUid: uid of parent to update items;
  - uids: list of uid to update.

- DELETE  
  Delete source or item.
  Expects json with 'uid' of source or item.


Install:
--------
 
Since it does't have cloudformation yet is not easy, install it on aws.
Good look!


Todo:
-----

- Fix *TODO* in this README;
- Fix security issues;
- Convert to servless/chalice;
- Add suport to multi user;
- make all this ugly code pretty;
