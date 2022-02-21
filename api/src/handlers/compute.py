import re
from sanic import Sanic
from sanic.views import HTTPMethodView
from sanic.response import json, text
from sanic.log import logger
import json as jsonlib
from sanic.response import stream

from sanic_jwt import protected, inject_user

class ComputesView(HTTPMethodView):

    decorators = [protected(), inject_user()]

    def __is_jsonable(self, x):
        try:
            jsonlib.dumps(x)
            return True
        except (TypeError, OverflowError):
            return False

    def __export_result(self, compute, app, private_key):
        try:
            result = app.ctx.ocean.job_status(private_key, compute['data_did'], compute['job_id'])
            compute["status"] = result["status"]
            compute["statusText"] = result["statusText"]
            return compute
        except:
            compute["status"] = None
            compute["statusText"] = None
            return compute

    async def post(self, request, user):
        app = Sanic.get_app("C2DFlow")

        private_key = user["private_key"]

        body = request.json      

        data_did = body['data_did']
        alg_did = body['alg_did']      

        data_asset = await app.ctx.assets_dao.get_asset_by_did(data_did)
        alg_asset = await app.ctx.assets_dao.get_asset_by_did(alg_did)

        job_id = app.ctx.ocean.compute(private_key, data_did, alg_did)
        await app.ctx.computes_dao.insert_compute(data_asset, alg_asset, job_id, user['_id'])

        return json({"job_id": job_id}, status=201)
    
    async def get(self, request, user):
        app = Sanic.get_app("C2DFlow")
        
        private_key = user["private_key"]        
        ordered = user['_id']

        job_id = request.args.get("job_id")

        if job_id != None:

            compute = await app.ctx.computes_dao.get_compute_by_job_id(job_id)

            if request.args and request.args.get("file"):
                data = app.ctx.ocean.job_result_file(private_key, compute['data_did'], job_id)
                result = jsonlib.dumps(data) if self.__is_jsonable(data) else data
                content_type = "application/octet-stream"                              
                return stream(lambda response: response.write(result), content_type=content_type)    
            if request.args and request.args.get("result"):
                result = jsonlib.dumps(app.ctx.ocean.job_result(private_key, compute['data_did'], job_id))               
                return stream(lambda response: response.write(result), content_type="application/json") 
            else:
                result = self.__export_result(compute, app, private_key)
                return json(result, status=200)   
        else:
            compute_list = await app.ctx.computes_dao.get_compute_by_ordered(ordered)
            return json(compute_list, status=200)

        
    