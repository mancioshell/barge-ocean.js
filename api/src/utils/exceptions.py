class OceanDDONotFoundError(Exception):
    
    def __init__(self, did, message="DDO not found"):
        self.did = did
        self.message = message
        super().__init__(self.message)