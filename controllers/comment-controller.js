//need both Comment and Pizza models
const { Pizza, Comment } = require('../models');

const commentController = {
    // add comment to pizza - add 'params' to relate to which pizza
    addComment({ params, body }, res) {
        console.log(body);
        Comment.create(body)
          .then(({ _id }) => {
            console.log(_id)
            return Pizza.findOneAndUpdate(
                { _id: params.pizzaId },
                //MongoDB-based built-in functions - $push to add the comment's '_id' to the specific pizza we're updating
                //same as javascript, this method adds data to an array
                { $push: { comments: _id } },
                { new: true }
              );
            })
            .then(dbPizzaData => {
              if (!dbPizzaData) {
                res.status(404).json({ message: 'No pizza found with this id!' });
                return;
              }
              res.json(dbPizzaData);
            })
            .catch(err => res.json(err));
    },    
    
    // remove comment:
    removeComment({ params }, res) {
        Comment.findOneAndDelete({ _id: params.commentId })
            .then(deletedComment  => {
                if (!deletedComment) {
                  return res.status(404).json({ message: 'No Comment found with this id!' });
                }
                return Pizza.findOneAndUpdate(
                    { _id: params.pizzaId },
                    { $pull: { comments: params.commentId } },
                    { new: true }
                  );
                })
                .then(dbPizzaData => {
                  if (!dbPizzaData) {
                    res.status(404).json({ message: 'No pizza found with this id!' });
                    return;
                  }
                  res.json(dbPizzaData);
                })
                .catch(err => res.json(err));
  }
}

module.exports = commentController;