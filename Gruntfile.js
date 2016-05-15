var utils = require('./utils'),
    mongoose = require('mongoose');

module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            src: ['*.js'],
            options: {
                browser: false
            }
        },
        watch: {
            js: {
                files: [
                    'app.js'
                ],
                tasks: ['jshint', 'develop'],
                options: {nospawn: true}
            }
        },
        develop: {
            server: {
                file: 'app.js',
                env: {MONGO_URL: 'mongodb://localhost/videoApi'}
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-develop');
    grunt.registerTask('reset', 'Drop collections', function() {
        var done = this.async();
        mongoose.connect('mongodb://localhost/videoApi');
        var db = mongoose.connection;
        db.once('open', function() {
            utils.dropCollections(db).then(function() {
                grunt.log.ok('Dropped Collections');
                db.close();
                done();
            });
        });
    });
    grunt.registerTask('fixtures', function() {
        var done = this.async();
        mongoose.connect('mongodb://localhost/videoApi');
        var db = mongoose.connection;
        db.once('open', function() {
            utils.applyFixtures().then(function() {
                grunt.log.ok("Fixtures created");
                done();
            }, function(err) {
                grunt.log.fail(err);
                done(err);
            });
        });
    });
    grunt.registerTask('initDb', ['reset', 'fixtures']);
    grunt.registerTask('default', ['jshint', 'develop', 'watch']);
};