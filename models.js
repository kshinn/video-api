var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    videoSchema = new Schema({
        url: String,
        created: {type: Date, default: Date.now},
        user_id: Schema.Types.ObjectId,
        likes: Number,
        dislikes: Number,
        score: {type: Number, default: 0}
    }),
    userSchema = new Schema({
        name: String,
        votes: Number
    }),
    userVideoSchema = new Schema({
        video_id: Schema.Types.ObjectId,
        user_id: Schema.Types.ObjectId,
        score: Number
    });

userSchema.index({name: 1}, {unique: true});
videoSchema.index({url: 1}, {unique: true});
userVideoSchema.index({video_id: 1, user_id: 1}, {unique: true});
userVideoSchema.index({user_id:1});

exports = module.exports = {
    Video: mongoose.model('Video', videoSchema),
    User: mongoose.model('User', userSchema),
    UserVideo: mongoose.model('UserVideo', userVideoSchema)
};
