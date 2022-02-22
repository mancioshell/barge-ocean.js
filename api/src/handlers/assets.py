from sanic import Sanic
from sanic.views import HTTPMethodView
from sanic.response import json, text
from sanic.log import logger

from sanic_jwt import protected, inject_user
from utils.decorators import not_cached_ddo

import json as jsonlib

class AssetsView(HTTPMethodView):

    decorators = [protected(), inject_user(), not_cached_ddo()]

    async def post(self, request, user):
        app = Sanic.get_app("C2DFlow")       
        private_key = user["private_key"]

        file = request.files.get("metadata")
        metadata = jsonlib.loads(file.body)
        name = request.form.get("name")
        type = request.form.get("type")
        description = request.form.get("description")
        did = app.ctx.ocean.publish_asset(private_key, name, metadata)
 
        await app.ctx.assets_dao.insert_asset(did, user["_id"], name, type, description)

        return json({"did": did}, status=201)   

    async def get(self, request, user):
        app = Sanic.get_app("C2DFlow")
        type = request.args.get("type")

        if type == "data":
            data = await app.ctx.assets_dao.get_data_assets()
        else:
            data = await app.ctx.assets_dao.get_algorithm_assets()

        return json(data, status=200)

class AssetsWithDidView(HTTPMethodView):

    decorators = [protected(), inject_user()]  

    async def put(self, request, user, did):

        app = Sanic.get_app("C2DFlow")
        private_key = user["private_key"]

        alg_did = request.json.get("alg_did") if request.json and request.json.get("alg_did") else None

        if alg_did:
            app.ctx.ocean.add_publisher_trusted_algorithm(private_key, did, alg_did)    
            alg_asset = await app.ctx.assets_dao.get_asset_by_did(alg_did) 
            await app.ctx.assets_dao.add_trusted_algorithm_to_asset(did, alg_asset)
        else:
            data_asset = await app.ctx.assets_dao.get_asset_by_did(did)
            user_data = await app.ctx.users_dao.get_user_by_id(data_asset['publisher'])
            publisher_private_key = user_data["private_key"]   
            app.ctx.ocean.acquires_datatoken(publisher_private_key, private_key, did)
            await app.ctx.assets_dao.add_buyer_to_asset(did, user["_id"])

        return json({}, status=200)

    async def get(self, request, user, did):
        app = Sanic.get_app("C2DFlow")

        data = await app.ctx.assets_dao.get_asset_by_did(did)

        return json(data, status=200)