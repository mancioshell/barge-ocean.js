#!/bin/bash

echo "Starting replica set initialize"
until mongo --host $MONGO1 --eval "print(\"waited for connection\")"
do
    sleep 2
done

until mongo --host $MONGO2 --eval "print(\"waited for connection\")"
do
    sleep 2
done

until mongo --host $MONGO3 --eval "print(\"waited for connection\")"
do
    sleep 2
done

echo "Connection finished"
echo "Creating replica set"
mongo --host $MONGO1 <<EOF
rs.initiate(
  {
    _id : 'rs0',
    members: [
      { _id : 0, host : $MONGO1, "priority": 4 },
      { _id : 1, host : $MONGO2, "priority": 2 },
      { _id : 2, host : $MONGO3, "priority": 1 }
    ]
  }
)
rs.reconfig(
  {
    _id : 'rs0',
    members: [
      { _id : 0, host : $MONGO1, "priority": 4 },
      { _id : 1, host : $MONGO2, "priority": 2 },
      { _id : 2, host : $MONGO3, "priority": 1 }
    ]
  },
  {
    "force" : true
  }  
)
EOF
echo "replica set created"

echo "Starting import data"

mongoimport --host rs0/$MONGO1,$MONGO2,$MONGO3 --db ocean --collection users --type json --file /initial-data/users.json --jsonArray

echo "Importing data finished"