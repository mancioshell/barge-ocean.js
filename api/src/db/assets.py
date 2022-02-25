from asyncio.log import logger
from sanic_motor.motor import BaseModel
from bson import ObjectId

types = ['data', 'alg']

class Asset(BaseModel):
    __coll__ = "assets"
    __unique_fields__ = ['did']


class AssetDao:

    def __init__(self):
        return
    
    async def insert_asset(self, did, publisher, name, type, description, output_type = None,): 

        asset = {
            "_id": str(ObjectId()),
            "did": did,
            "type": type,
            "output_type": output_type,
            "name": name,
            "description": description,
            "publisher": publisher,
            "buyers": []
        }

        asset["algorithms"] = [] if type == "data" else None

        new_asset = await Asset.insert_one(asset)

        return new_asset.inserted_id

    async def add_trusted_algorithm_to_asset(self, did, alg):      

        updated_asset = await Asset.update_one({"did": did}, { "$push": { "algorithms": {"did": alg["did"]} } })

        return updated_asset

    async def add_buyer_to_asset(self, did, buyer):      

        updated_asset = await Asset.update_one({"did": did}, { "$push": { "buyers": buyer } })

        return updated_asset

    async def get_asset_by_did(self, did):

        asset = await Asset.find_one(
            {"did": did}, as_raw=True
        )

        return asset

    async def __add_algorithm_to_data(self, data):

        algorithms = [await self.get_asset_by_did(algorithm["did"]) for algorithm in data["algorithms"]]
        data["algorithms"] = algorithms
     
        return data

    async def get_data_assets(self):        

        cursor = await Asset.find({"type": "data"}, as_raw=True)        

        result = [await self.__add_algorithm_to_data(data) for data in cursor.objects]
        return result

    async def get_algorithm_assets(self):

        cursor = await Asset.find(
            {"type": "alg"}, as_raw=True
        )

        return cursor.objects
