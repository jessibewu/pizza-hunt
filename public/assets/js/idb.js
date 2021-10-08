// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
// By default, we start it at 1. This parameter is used to determine whether the database's structure has changed between connections. 
// Think of it as if you were changing the columns of a SQL database.
// **As part of the browser's window object, indexedDB is a global variable. 
// **Thus, we could say window.indexedDB, but there's no need to here
const request = indexedDB.open('pizza_hunt', 1);

// this event will emit if the database version changes (non-exist to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    // instruct the store to have an 'auto incrementing' index/key for each new set of data we insert. 
    // Otherwise we'd have a hard time retrieving data.
    db.createObjectStore('new_pizza', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded() event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
      uploadPizza();
    }
  };
  
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
// Will be used in the add-pizza.js file's form submission function if the fetch() function's .catch() method is executed.
// which the fetch() function's .catch() method is only executed on network failure!
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access the object store for `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // add record to your store with add method
    pizzaObjectStore.add(record);
  }

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // get all records from store and set to a variable
    // *but, it doesn't automatically receive the data from the new_pizza object store
    // *the .getAll() method is an asynchronous function that we have to attach an event handler to in order to retrieve the data. 
    const getAll = pizzaObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this getAll.onsuccess() event 
    // *the getAll variable created above will have a '.result' property that's an array of all the data retrieved from the new_pizza object store
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        // the Mongoose .create() method we use to create a pizza can handle either single objects or an array of objects, 
        // so no need to create another route/controller method to handle this one event.
        fetch('/api/pizzas', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['new_pizza'], 'readwrite');
            // access the new_pizza object store
            const pizzaObjectStore = transaction.objectStore('new_pizza');
            // clear all items in your store
            pizzaObjectStore.clear();

            alert('All saved pizza has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
  };
  }

// listen for app coming back online
window.addEventListener('online', uploadPizza);