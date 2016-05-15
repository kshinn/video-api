# Video API

## Setup
Clone this repo:
```git clone git@github.com/kshinn/video-api```

Install the modules:

```
npm install
```

## Requirements
This project uses node.js and MongoDb. The node version should be 0.12.x or 4.x;

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