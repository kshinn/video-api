var assert = require('chai').assert,
    request = require('request'),
    Promise = require('bluebird'),
    BASE_URL = 'http://localhost:9001';

function voteRequest(video, voter, action) {
    return new Promise(function(rs, rj) {
        request({
            url: BASE_URL + '/videos/' + video._id + '/' + action,
            method: 'POST',
            body: {
                user_id: voter._id
            },
            json: true
        }, function(err, resp, result) {
            if (err) {
                rj(err);
            } else {
                rs(resp.statusCode);
            }
        });
    });
}

describe('Basic API', function() {
    var users;
    before(function(done) {
        request(BASE_URL + '/users', function(err, resp, result) {
            users = JSON.parse(result);
            done();
        })
    });

    it('should be able to post videos', function(done) {
        var poster = users[0];

        request({
            url: 'http://localhost:9001/videos',
            method: 'POST',
            body: {
                'user_id': poster._id,
                'url': 'http://test.vid',
                'name': 'Awesome video'
            },
            json: true
        }, function(err, resp, result) {
            assert.equal(resp.statusCode, 201);
            done()
        })
    });

    it('should not be able to post a video twice', function(done) {
        var poster = users[0];
        request({
            url: 'http://localhost:9001/videos',
            method: 'POST',
            body: {
                'user_id': poster._id,
                'url': 'http://test.vid',
                'name': 'Awesome video'
            },
            json: true
        }, function(err, resp, result) {
            assert.equal(resp.statusCode, 400);
            done()
        })
    });

    it('should not allow another user to post the same video', function(done){
        var poster = users[1]
        request({
            url: BASE_URL + '/videos',
            method: 'POST',
            body: {
                'user_id': poster._id,
                'url': 'http://test.vid',
                'name': 'Awesome video copy'
            },
            json: true
        }, function(err, resp, result) {
            assert.equal(resp.statusCode, 400);
            done()
        })
    });

    it('should not allow non existent users to post a video', function(done) {
       request({
            url: BASE_URL + '/videos',
            method: 'POST',
            body: {
                'user_id': '5737d121ac7c9cb1443f9362',
                'url': 'http://dne.vid',
                'name': 'Should not save'
            },
            json: true
        }, function(err, resp, result) {
            assert.equal(resp.statusCode, 400);
            done()
        })
    })
    describe('Voting', function() {
        var videos;

        before(function(done) {
            request({
                url: BASE_URL + '/videos',
                method: 'POST',
                json: true,
                body: {
                    url: 'http://video-diff.net',
                    name: 'A different video',
                    user_id: users[1]
                }
            }, function(err, resp, result) {
                done();
            })
        });

        before(function(done) {
            request(BASE_URL + '/videos', function(err, resp, result) {
                videos = JSON.parse(result);
                done();
            });
        });

        it('should allow users to like videos', function(done) {
            var voter = users[1],
                video = videos[0];

            voteRequest(video, voter, 'like').then(function(respStatus) {
                assert.equal(respStatus, 204);
                done();
            })
            .error(function(err) {
                assert.fail();
                done();
            });
        });

        it('should allow users to dislike videos', function(done) {
            var voter = users[0],
                video = videos[1];

            voteRequest(video, voter, 'dislike').then(function(respStatus) {
                assert.equal(respStatus, 204);
                done();
            })
            .error(function(err) {
                assert.fail(err);
                done();
            })
        });

        it('should not allow unknown actions', function(done) {
            var voter = users[2],
                video = videos[0];

            voteRequest(video, voter, 'hate').then(function(respStatus) {
                assert.equal(respStatus, 404);
                done();
            })
        });

        it('should not allow non existent users to vote', function(done) {
            var voter = {_id: 'does-not-exist'},
                video = videos[0];

            voteRequest(video, voter, 'like').then(function(respStatus) {
                assert.equal(respStatus, 400);
                done();
            })
        });

        it('should not allow the same user to vote twice on the same video', function(done) {
            var voter = users[1],
                video = videos[0];

            voteRequest(video, voter, 'like').then(function(respStatus) {
                assert.equal(respStatus, 403);
                done();
            });
        });

        it('should not allow the original to poster to like his video', function(done) {
            var video = videos[0],
                voter = {_id: video.user_id};

            voteRequest(video, voter, 'like').then(function(respStatus) {
                assert.equal(respStatus, 403)
                done();
            })
        });
    })
    describe('Scoring', function() {
        var scoreVideos;
        before(function(done) {
            request({
                url: BASE_URL + '/videos',
                method: 'POST',
                json: true,
                body: {
                    user_id: users[2],
                    url: 'http://video.3',
                    name: 'Scoring video'
                }
            }, function(err, resp, result) {
                done();
            });
        });

        beforeEach(function(done) {
            request(BASE_URL + '/videos', function(err, resp, result) {
                scoreVideos = JSON.parse(result);
                done();
            });
        })

        it('should have an initial score of 0', function(done) {
            var lastVid = scoreVideos[scoreVideos.length - 1];
            assert.equal(lastVid.score, 0);
            done();
        })

        it('should reflect a like', function(done) {
            var lastVid = scoreVideos[scoreVideos.length - 1];
            voteRequest(lastVid, users[0], 'like')
            .then(function() {
                request(BASE_URL + '/videos', function(err, resp, result) {
                    var allVids =  JSON.parse(result),
                        lastVid = allVids[allVids.length - 1];
                    assert.equal(lastVid.score, 1);
                    done();
                })
            }, function(err) {
                assert.fail(err);
                done();
            });
        });

        it('should reflect a dislike', function(done) {
            var lastVid = scoreVideos[scoreVideos.length - 1];
            voteRequest(lastVid, users[1], 'dislike')
            .then(function() {
                request(BASE_URL + '/videos', function(err, resp, result) {
                    var allVids =  JSON.parse(result),
                        lastVid = allVids[allVids.length - 1];
                    assert.equal(lastVid.score, 0);
                    done();
                })
            }, function(err) {
                assert.fail(err);
                done();
            });
        });
    });
    describe('Unseen', function() {
        var videos, totalVids, scoreUser,
            getUnseen = function(user) {
                return new Promise(function(rs, rj) {
                    request({
                        url: BASE_URL + '/videos/unseen',
                        method: 'GET',
                        qs: {
                            user_id: user._id
                        }
                    }, function(err, resp, result) {
                        if (err) {
                            rj(err);
                            return;
                        }

                        var videos = JSON.parse(result);
                        rs(videos);
                    });
                });
            }
        before(function(done) {
            scoreUser = users[3];
            request(BASE_URL + '/videos', function(err, resp, result) {
                videos = JSON.parse(result);
                totalVids = videos.length;
                done();
            });
        });

        it('should list all videos for a new user', function(done) {
            request({
                url: BASE_URL + '/videos/unseen',
                method: 'GET',
                qs: {
                    user_id: scoreUser._id
                }
            }, function(err, resp, result) {
                var videos = JSON.parse(result);
                assert.equal(videos.length, totalVids);
                done();
            });
        });

        it('should list less after voting', function(done) {
            voteRequest(videos[0], scoreUser, 'like')
            .then(function(result) {
                return getUnseen(scoreUser);
            })
            .then(function(videos) {
                assert(videos.length, totalVids - 1);
                done();
            });
        });
    });
});