from functools import wraps
from sanic.response import json
from utils.exceptions import OceanDDONotFoundError

def not_cached_ddo():
    def decorator(f):
        @wraps(f)
        async def decorated_function(request, *args, **kwargs):

            try:
                response = await f(request, *args, **kwargs)
            except OceanDDONotFoundError as err:
                return json({"message": 'DDO with {} not foud'.format(err.did)}, 404)
            return response

        return decorated_function
    return decorator