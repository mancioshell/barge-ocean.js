# Ocean Protocol C2D Flow UI

This is a gui application based on [CD2-Flow](https://github.com/oceanprotocol/ocean.py/blob/main/READMEs/c2d-flow.md) of Ocean Protocol.

## System requirements

- docker *
- docker-compose
- dos2unix **

\* If you use Windows / Mac system you should configure Docker to allow for more than 2GB of memory.

\*\* If you use Windows system, it is not needed if you run the application in a git bash.

## Components

- api : Sanic Python REST API
- mongodb: to save data to help the interaction with barge
- app : React App UI
- barge : Ocean Protocol Barge

## Start the application

To start the application, run the following command:

```bash
./start_ocean.sh
```


## Use the application

Application starts with 2 preset users:


| Username | Password       |
|----------|----------------|
| alice    | alice1234      |
| bob      | bob1234        |


You can found Asset and Algorithm metadata in assets folder.

To use the application:

* Open the browser and type http://localhost 
* Enjoy using C2D Flow. :)

## Kubernetes

Inside your /etc/hotsts: 

```
127.0.0.1 http://ocean-c2d-flow.com/
```

```bash
minikube start
minikube addons enable ingress
minikube tunnel
```

