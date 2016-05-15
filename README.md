# Video API

## Setup
Clone this repo:
```git clone git@github.com/kshinn/video-api```

Install the modules:

```
npm install
```

## Requirements
This project uses node.js and MongoDb. The node version should be 0.12.x or 4.x; mongo version should be 3+

## Running
There are 2 ways to run this project:
If you have `grunt` installed on the local environment: Simply run `grunt`
Grunt will run in a development mode where it will connect to a locally running mongodb process running on the default port.

To run this project without grunt:
```
MONGO_URL="mongodb://localhost/dbName" node app.js
```

Since there are no endpoints to manage users at this point, the following grunt commands can be used to bootstrap the database:

Insert fixture users with:
```
grunt fixtures
```

Drop all of the collections with:
```
grunt reset
```

Run both
```
grunt initDb
```

## Tests
Tests are written in mocha. Currently, the tests assume a clean database by running the following commands:

```
grunt initDb
grunt
```

and in a separate terminal / prcess
```
mocha tests
```

## Future enhancements
The storage layer was built on mongodb. The intention is to shard the data over a cluster to keep the collection size low per server. As the dataset grows, new shards can be added to the cluster to scale the data horizontally.

The most costly query is the unseen videos. While this current approach will work relatively well for the first few orders of magnitude, it will become progressively slower for users that rate lots of videos. The next iteration to deal with scaling would be to track views and voting in an Elasticsearch cluster. This will make it fast an easy to search unseen videos and calculate aggregates such as highest rated within various time ranges.

Redis can be used as an application cache layer. The routes were constructed in such a way that a simple cache could be added with an additional middleware function. I did not choose to add caching at any of the route levels because the cost of setup and maintenance does not yet outweight the benefit to use in these particular routes.