var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    models = require('./models'),
    handlers = require('./handlers'),
    port = process.env.port || "9001",
    db;


// Middleware
function checkRequired(args) {
    return function(req, res, next) {
        var submittedKeys = _.keys(req.body),
            missingKeys = _.difference(args, submittedKeys);

        if (missingKeys.length === 0) {
            next();
        } else {
            res.status(400).end("Missing values: " + JSON.stringify(missingKeys));
            return;
        }

    };
}

function loadVideo(req, res, next) {
    models.Video.findOne({_id: req.params.videoId}).then(function(result) {
        if (!result) {
            console.log(result);
            res.status(404).end();
            return;
        } else {
            req.video = result;
            next();
        }
    });
}

function loadUser(req, res, next) {
    var userId = req.body.user_id || req.query.user_id;

    models.User.findOne({_id: userId}).then(function(result) {
        if (!result) {
            res.status(400).end("User not found");
            return;
        } else {
            req.user = result;
            next();
        }
    }, function(err) {
        res.status(400).end("User not found");
    });
}

function transmitResponse(req, res) {
    if (res.statusCode < 210) {
        console.log('returning ' + res.statusCode);
        console.log(res.locals.payload);
        res.send(res.locals.payload);
    } else {
        res.end(res.locals.message);
    }
}

// bootstrap database
db = mongoose.connect(process.env.MONGO_URL);

// Setup middleware
app.use(bodyParser.json());

// Setup Routes
app.post('/videos',
         checkRequired(['user_id', 'url']),
         loadUser,
         handlers.videoPost);

app.get('/videos', handlers.videoGet);

app.get('/videos/unseen',
        loadUser,
        handlers.videosUnseen);

app.get('/videos/best',
        handlers.videosBest);

app.post('/videos/:videoId/:type',
         checkRequired(['user_id']),
         loadUser,
         loadVideo,

         handlers.videoVote);

app.get('/users', handlers.usersGet);

app.listen(port, function() {
    console.log('Server listenting at ' + port);
});
