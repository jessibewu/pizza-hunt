const { Pizza } = require('../models');

const pizzaController = {
  // the functions will go in here as methods
  // get all pizzas: GET /api/pizzas
  getAllPizza(req, res) {
    Pizza.find({})
      //This is to show comment contents (rather than just comment id)
      //Get the full document from a different document.
      .populate({
        path: 'comments',
        //tell Mongoose that we don't care about the __v field on comments. 
        //The '-' in front of '__v' indicates that we don't want it to be returned. 
        //If we didn't have it, it would mean that it would return only the __v field.
        select: '-__v'
      })
      //to not include the pizza's __v field either
      .select('-__v')
      //to sort in DESC order by the _id value
      .sort({ _id: -1 })
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get one pizza by id: GET /api/pizzas/:id
  // get one pizza by id
  getPizzaById({ params }, res) {
    Pizza.findOne({ _id: params.id })
      .populate({
        path: 'comments',
        select: '-__v'
      })
      .select('-__v')
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
},

  // createPizza: POST /api/pizzas
  // In MongoDB, the methods for adding data to a collection are .insertOne() or .insertMany(). 
  // But in Mongoose, we use the .create() method, which will actually handle either one or multiple inserts!
  createPizza({ body }, res) {
    Pizza.create(body)
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => res.json(err));
  },

  // update pizza by id: PUT /api/pizzas/:id
  // There are also Mongoose and MongoDB methods called .updateOne() and .updateMany(), 
  // which update documents without returning the value (but just the id).
  updatePizza({ params, body }, res) {
    Pizza.findOneAndUpdate({ _id: params.id }, body, { new: true })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.status(400).json(err));
  },

  // delete pizza: DELETE /api/pizzas/:id
  // Like the above, we could also use .deleteOne() or .deleteMany(), 
  // but the .findOneAndDelete() method returns the deleted data in case the client wants it.
  deletePizza({ params }, res) {
    Pizza.findOneAndDelete({ _id: params.id })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => res.status(400).json(err));
  }
};



module.exports = pizzaController;