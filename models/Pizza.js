const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const PizzaSchema = new Schema(
  {
    pizzaName: {
      type: String,
      required: 'You need to provide a pizza name!', // or 'true'
      trim: true
    },
    createdBy: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // add getters to format dateFormat (like middleware)
      // MongoDB operates on a find-or-create mentality in that if it finds the database you want to connect to, it'll use it. 
      // If not, it'll simply create the database.
      get: (createdAtVal) => dateFormat(createdAtVal)
    },
    size: {
      type: String,
      //If you were to provide a custom error message for the required option here, you wouldn't receive it if you provide a size that isn't listed in the enum option. 
      //If you want to provide a custom message for enumerable values, you need to look into implementing the 'validate option' Mongoose lets you use, where you can create a custom function to test the values, just like you did with Inquirer
      required: true,
      //enumerable: refers to a set of data that can be iterated over— like the for...in loop to iterate through an object
      // provides an array of options that this size field will only accept
      enum: ['Personal', 'Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Large'
    },
    toppings: [], // or put Array
    //**Sequelize: we store a reference of the parent data's id with the child data.
    //**Mongoose, we can instruct the parent to keep track of its children, not the other way around. 
    comments: [
      {
        //tell Mongoose to expect an 'ObjectId' to tell it that its data comes from the Comment model
        type: Schema.Types.ObjectId,
        //The ref property is important because it tells the Pizza model which documents to search to find the right comments.
        ref: 'Comment'
      }
    ]
  },
  {
    //tell schema that it can use virtuals & getters
    toJSON: {
      virtuals: true,
      getters: true
    },
    //Set id to false because this is a virtual that Mongoose returns and we don’t need it
    id: false
  }
  );

// Virtual: get total count of comments and replies on retrieval
PizzaSchema.virtual('commentCount').get(function() {
  //using the .reduce() method to tally up the total of every comment with its replies. 
  //  In its basic form, .reduce() takes two parameters, an 'accumulator' (total) and a 'currentValue' (comment). 
  //  As .reduce() walks through the array, it passes the accumulating total and the current value of comment into the function, 
  //  with the return of the function revising the total for the next iteration through the array.
  //  The built-in .reduce() method is great for calculating a value based off of the accumulation of values in an array vs .map.
  return this.comments.reduce((total, comment) => total + comment.replies.length + 1, 0);
});

// create the Pizza model using the PizzaSchema
const Pizza = model('Pizza', PizzaSchema);

// export the Pizza model
module.exports = Pizza;