from logging import Logger
from sanic import Sanic
from sanic.log import logger

from ocean_lib.config import Config
from ocean_lib.example_config import ExampleConfig
from adapters.config import OceanConfig
from ocean_lib.ocean.ocean import Ocean
from ocean_lib.web3_internal.wallet import Wallet

from ocean_lib.web3_internal.currency import to_wei
from ocean_lib.data_provider.data_service_provider import DataServiceProvider
from ocean_lib.services.service import Service
from ocean_lib.common.agreements.service_types import ServiceTypes

from ocean_lib.assets.trusted_algorithms import add_publisher_trusted_algorithm

from ocean_lib.web3_internal.constants import ZERO_ADDRESS
from ocean_lib.models.compute_input import ComputeInput

from utils.exceptions import OceanDDONotFoundError

import pickle

from tenacity import retry, stop_after_attempt, wait_fixed

class OceanAdapter:

    def __init__(self):
        
        self.app = Sanic.get_app("C2DFlow")
        self.ocean = self.__get_instance()

    def __get_instance(self):
        d = {
            'network' : self.app.config.OCEAN_NETWORK_URL,
            'metadataCacheUri' : self.app.config.METADATA_CACHE_URI,
            'providerUri' : self.app.config.PROVIDER_URL
        }
        config = OceanConfig.get_config(d)
        ocean = Ocean(config)
        return ocean

    def __get_wallet(self, private_key):
        return Wallet(
            self.ocean.web3,
            private_key,
            self.ocean.config.block_confirmations,
            self.ocean.config.transaction_timeout,
        )

    def __create_service_attributes(self, wallet):
        return {
            "main": {
                "name": "AssetAccessServiceAgreement",
                "creator": wallet.address,
                "timeout": 3600 * 24,
                "datePublished": "2019-12-28T10:55:11Z",
                "cost": 1.0, # <don't change, this is obsolete>
            }
        }

    def __is_picklable(self, obj):
        try:
            pickle.loads(obj)

        except pickle.UnpicklingError:
            return False
        return True

    def __pickle_obj(self, obj):
        result = pickle.loads(obj)
        lists = result.tolist() 
        return lists

    @retry(stop=stop_after_attempt(20), wait=wait_fixed(10))
    def is_ddo_cached(self, did):
        DDO = self.ocean.assets.resolve(did)
        if DDO is None:
            raise OceanDDONotFoundError(did)


    def publish_asset(self, private_key, name, metadata):

        wallet = self.__get_wallet(private_key)
        service_attributes = self.__create_service_attributes(wallet)
        
        datatoken = self.ocean.create_data_token(name, name, wallet, blob=self.ocean.config.metadata_cache_uri)
        datatoken.mint(wallet.address, to_wei(100), wallet)

        provider_url = DataServiceProvider.get_url(self.ocean.config)

        compute_service = Service(
            service_endpoint=provider_url,
            service_type=ServiceTypes.CLOUD_COMPUTE,
            attributes=service_attributes
        )

        ddo = self.ocean.assets.create(
            metadata=metadata, # {"main" : {"type" : "dataset", ..}, ..}
            publisher_wallet=wallet,
            services=[compute_service],
            data_token_address=datatoken.address
        )

        self.is_ddo_cached(ddo.did)

        return ddo.did

    def add_publisher_trusted_algorithm(self, private_key, data_did, alg_did):

        wallet = self.__get_wallet(private_key)

        DATA_DDO = self.ocean.assets.resolve(data_did)
        if DATA_DDO is None:
            raise OceanDDONotFoundError(data_did)

        add_publisher_trusted_algorithm(DATA_DDO, alg_did, self.ocean.config.metadata_cache_uri)
        self.ocean.assets.update(DATA_DDO, publisher_wallet=wallet)

        return

    def acquires_datatoken(self, from_private_key, to_private_key, did):

        from_wallet = self.__get_wallet(from_private_key)
        to_wallet = self.__get_wallet(to_private_key)

        DDO = self.ocean.assets.resolve(did)        
        if DDO is None:
            raise OceanDDONotFoundError(did)

        datatoken = self.ocean.get_data_token(DDO.data_token_address)
        datatoken.transfer(to_wallet.address, to_wei(5), from_wallet=from_wallet)

        return

    def compute(self, private_key, data_did, alg_did):

        wallet = self.__get_wallet(private_key)

        DATA_DDO = self.ocean.assets.resolve(data_did)  
        if DATA_DDO is None:
            raise OceanDDONotFoundError(data_did)
            
        ALG_DDO = self.ocean.assets.resolve(alg_did)
        if ALG_DDO is None:
            raise OceanDDONotFoundError(alg_did)

        compute_service = DATA_DDO.get_service('compute')
        algo_service = ALG_DDO.get_service('access')

        dataset_order_requirements = self.ocean.assets.order(
            data_did, wallet.address, service_type=compute_service.type
        )

        DATA_order_tx_id = self.ocean.assets.pay_for_service(
            self.ocean.web3,
            dataset_order_requirements.amount,
            dataset_order_requirements.data_token_address,
            data_did,
            compute_service.index,
            ZERO_ADDRESS,
            wallet,
            dataset_order_requirements.computeAddress,
        )

        algo_order_requirements = self.ocean.assets.order(
            alg_did, wallet.address, service_type=algo_service.type
        )
        ALG_order_tx_id = self.ocean.assets.pay_for_service(
            self.ocean.web3,
            algo_order_requirements.amount,
            algo_order_requirements.data_token_address,
            alg_did,
            algo_service.index,
            ZERO_ADDRESS,
            wallet,
            algo_order_requirements.computeAddress,
        )

        compute_inputs = [ComputeInput(data_did, DATA_order_tx_id, compute_service.index)]
        job_id = self.ocean.compute.start(
            compute_inputs,
            wallet,
            algorithm_did=alg_did,
            algorithm_tx_id=ALG_order_tx_id,
            algorithm_data_token=ALG_DDO.data_token_address
        )

        return job_id

    def job_status(self, private_key, data_did, job_id):

        wallet = self.__get_wallet(private_key)

        result = self.ocean.compute.status(data_did, job_id, wallet)
       
        return result      
    
    def job_result_file(self, private_key, data_did, job_id):

        wallet = self.__get_wallet(private_key)

        result = self.ocean.compute.status(data_did, job_id, wallet)

        if result['status'] == 70:
            data = self.ocean.compute.result_file(data_did, job_id, 0, wallet)
            model = self.__pickle_obj(data) if self.__is_picklable(data) else data                  

            return model
        else:
            return None

    def job_result(self, private_key, data_did, job_id):

        wallet = self.__get_wallet(private_key)

        result = self.ocean.compute.status(data_did, job_id, wallet)

        if result['status'] == 70:
            data = self.ocean.compute.result(data_did, job_id, wallet)

            return data
        else:
            return None
