#!/bin/bash

echo "Starting application ..."

export ADDRESS_FILE=~/.ocean/ocean-contracts/artifacts/address.json

export SANIC_MOTOR_URI='mongodb://localhost:27017/ocean'
export SANIC_OCEAN_NETWORK_URL='http://localhost:8545'
export SANIC_METADATA_CACHE_URI='http://localhost:5000'
export SANIC_PROVIDER_URL='http://localhost:8030'

cd src
poetry run python server.py
