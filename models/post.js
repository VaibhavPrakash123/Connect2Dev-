const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const PostSchema = new Schema({

    user : {
        type : mongoose.Types.ObjectId,
        ref : 'users'
    },

    text : {
        type: String,
        required: true
    },

    name : {
        type: String,
        
    },

    avatar  : {
        type : String
    },

    likes : [{
        user:{
            type: mongoose.Types.ObjectId,
            ref: 'users'
        },

    }],

    comments : [{
        user: {
            type : mongoose.Types.ObjectId,
            ref: 'users'
        },
        name : {
            type: String,
            required : true
        },
    
        avatar  : {
            type : String
        },

        date : {
            type: Date,
            default : Date.now()
        },

        text:{
            type: String,
            required: true
        }
    

    }],

    date : {
        type : Date,
        default : Date.now()
    }

})

module.exports = Post = mongoose.model('posts', PostSchema);