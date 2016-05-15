var models = require('./models'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    db;

function applyFixtures() {
    var users = ['foo', 'bar', 'baz', 'scorekeep'],
        userResult = [];

    users.forEach(function(item) {
        var user = new models.User({
            name: item
        });

        userResult.push(new Promise(function(resolve, reject) {
            user.save(function(err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log('Saved '  + item);
                    resolve(item);
                }
            });
        }));
    });
    return Promise.all(userResult);
}

function dropCollections(db) {
    var dropHandler = function(resolve, reject, err, result) {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    },
    allDropped = [
        new Promise(function(rs, rj) {
            db.db.dropCollection('users', _.partial(dropHandler, rs, rj));
        }),
        new Promise(function(rs, rj) {
            db.db.dropCollection('videos', _.partial(dropHandler, rs, rj));
        }),
        new Promise(function(rs, rj) {
            db.db.dropCollection('uservideos', _.partial(dropHandler, rs, rj));
        })
    ];

    return Promise.all(allDropped);
}

exports = module.exports = {
    dropCollections: dropCollections,
    applyFixtures: applyFixtures
};
