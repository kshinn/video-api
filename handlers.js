var models = require('./models'),
    _ = require('lodash');

var DUPLICATE_ERR = 11000,
    PAGE_LIMIT = 25;

function HttpError(code, message) {
    this.code = code;
    this.message = message;
}

exports = module.exports = {
    videoPost: function(req, res) {
        var newVideo = new models.Video(req.body);

        newVideo.save(function(err) {
            if (err) {
                if (err.code == DUPLICATE_ERR) {
                    res.status(400).end("Video has already been submitted");
                } else {
                    res.status(500).end("Something on the server went wrong");
                }
            } else {
                res.status(201).end();
            }
        });
    },
    videoGet: function(req, res) {
        var skipNum = req.query.page || 0;

        models.Video.find()
            .sort({created: 1})
            .skip(skipNum * PAGE_LIMIT)
            .limit(PAGE_LIMIT)
            .then(function(result) {
                res.json(result);
            });
    },
    videoVote: function(req, res) {
        // Check for acceptable type
        if (_.indexOf(['like', 'dislike'], req.params.type) == -1) {
            res.status(404).end();
            return;
        }

        if (req.video.user_id == req.body.user_id) {
            res.status(403).end("You cannot vote on your own video");
            return;
        }

        // Check to see if the user has voted before
        models.UserVideo.findOne({
            video_id: req.params.videoId,
            user_id: req.body.user_id
        }).then(function(result) {
            if (result) {
                throw new HttpError(403, "You may not vote more than once on a video");
            }
            else {
                var newVote = new models.UserVideo({
                    user_id: req.body.user_id,
                    video_id: req.params.videoId,
                    score: (req.params.type === 'like') ? 1 : -1
                });
                return newVote.save();
            }
        })
        .then(function(result) {
            req.video.score += result.score;
            return req.video.save();
        })
        .then(function(result) {
            res.status(204).end();
        }, function(err) {
            if (err.code) {
                res.status(err.code).end(err.message);
            } else {
                console.log(err);
                res.status(500).end("Something went wrong");
            }
        });
    },
    videosUnseen: function(req, res) {
        models.UserVideo.find({user_id: req.user._id}).then(function(results) {
            var seenIds = _.map(results, function(item){
                return item.video_id;
            });
            return seenIds;
        })
        .then(function(exclude) {
            models.Video.find({'$and': [
                {user_id: {'$ne': req.user._id}},
                {_id: { '$nin': exclude }}]
            }).then(function(result) {
                res.json(result);
            }, function(err) {
                console.log(err);
                res.status(500).end(err);
            });
        }, function(err) {
            console.log(err);
            res.status(500).end(err);
        });
    },
    videosBest: function(req, res) {
        models.Video.find()
        .sort({score: -1})
        .limit(PAGE_LIMIT).then(function(result) {
            res.json(result);
        }, function(err) {
            res.status(500).end(err);
        });
    },
    usersGet: function(req, res) {
        models.User.find().then(function(results) {
            res.json(results);
        });
    }
};