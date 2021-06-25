'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var postSchema = Schema( {
  text: String,
  imageURL: String,
  userId: ObjectId,
  createdAt: Date
} );

module.exports = mongoose.model( 'Post', postSchema );
