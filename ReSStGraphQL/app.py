import json
import logging
from chalice import Chalice
from chalicelib.queries import itemQuery

app = Chalice(app_name='ReSStGraphQL')


@app.route('/', methods=['GET'])
def index_get():
    return {'hello': 'world'}


@app.route('/', methods=['POST'])
def index_post():
    try:
      body = app.current_request.raw_body
      query_result = itemQuery.execute(body.decode())
      print(json.dumps(query_result.data))
      return json.dumps({
        'data': query_result.data,
        'errors': [str(e) for e in (query_result.errors or [])],
        'invalid': query_result.invalid
      })
    except Exception as e:
      logging.exception(str(e))
      return json.dumps({
        'data': {},
        'errors': [str(e)],
        'invalid': True
      })