// Types:
// We'll need a unique id for reply instead of the default _id field that is created, so we'll add a custom replyId field. 
// Despite the custom field name, we're still going to have it generate the same type of ObjectId() value that the _id field typically does, 
// but we'll have to import that type of data first.
const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ReplySchema = new Schema(
    {
      // With the 'Types' object imported: 
      // set custom id to avoid confusion with parent comment _id
      replyId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
      },
      replyBody: {
        type: String,
        required: 'You need to provide a reply!', // or 'true'
        trim: true
      },
      writtenBy: {
        type: String,
        required: 'You need to provide your name!', // or 'true'
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now,
        get: createdAtVal => dateFormat(createdAtVal)
      }
    },
    {
      toJSON: {
        getters: true
      }
    }
  );

const CommentSchema = new Schema({
    writtenBy: {
      type: String,
      required: 'You need to provide your name!', // or 'true'
      trim: true
    },
    commentBody: {
      type: String,
      required: 'You need to provide a comment!', // or 'true'
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (createdAtVal) => dateFormat(createdAtVal)
    },
    //Note that unlike our relationship between pizza and comment, 
    //replies will be nested directly in a comment's document and not referred to
    replies: [ReplySchema]
  },
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    id: false
  }
  );

CommentSchema.virtual('replyCount').get(function() {
    // this.replies = referring to the above 'replies' field
    return this.replies.length;
});  

// create the Comment model using the CommentSchema
const Comment = model('Comment', CommentSchema);

// export the Comment model
module.exports = Comment;