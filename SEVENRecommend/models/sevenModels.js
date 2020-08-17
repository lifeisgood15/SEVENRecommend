const mongoose= require('mongoose');
const { ObjectID } = require('mongodb');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username : {
        type:String,
        required:'Enter a user name'
    },
    email: {
        type:String,
        required:'Enter a valid email address'
    },
    colour:{
        type:String,
        default:'#ffffff'
    },
    password:{
        type:String,
        required:'Enter your password'
    },
    created_date:{
        type:Date,
        default:Date.now
    },
    loginTimestamp:{
        type:Date,
        default:Date.now
    }
});
const ListSchema = new Schema({
    category : {
        type:String,
        required:'Enter a category'
    },
    created_by: {
        type:String,
        required:'Enter created by'
    },
    list_name:{
        type:String,
        required:'Enter list name'
    },
    list_description:{
        type:String,
        required:'Enter list description'
    },
    timestamp:{
        type:Date,
        default:Date.now
    },

});

const SavedListSchema = new Schema({
    list_id:{
        type:ObjectID,
        required:'Enter email of saver'
    },

    saved_by:{
        type:String,
        required:'Enter email of saver'
    }
});

const SavedUserSchema = new Schema({
    useremail : {
        type:String,
        required:'Enter an email to save'
    },
    saved_by:{
        type:String,
        required:'Enter email of saver'
    }
});

const ItemSchema = new Schema({
    list_id : {
        type:String,
        required:'Invalid'
    },
    item_order:{
        type:Number,
        required:'Enter a order'
    },
    item_name:{
        type:String,
        required:'Enter item name'
    },
    item_description:{
        type:String,  
    },

});

module.exports= {UserSchema,ListSchema,SavedListSchema, SavedUserSchema,ItemSchema};
