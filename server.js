var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');
var mongodb = require('mongodb');
var assert = require('assert');

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});


app.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
})


//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://jgines:12344321@ds051740.mongolab.com:51740/aloneinthelab-db';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    var collection = db.collection('users');

    /*
    var user1 = {
  		nombre    : 'Jonathan',
  		apellido  : 'Gines',
  		email	  : 'jonathangines@hotmail.com',
  		idiomaNativo    : 'spanish',
  		idiomaDeseado	: 'english',
  		nivel	:  '1'
	};
	collection.insert(user1, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
      }
  	});*/


    collection.update({ nombre : 'Jonathan' }
          , { $set: { email : 'manuel@hotmail.com' } }, function(err, result) {
            //assert.equal(err, null);
            //assert.equal(1, result.result.n);
            console.log("Updated the document");
            //callback(result);
        });  

  	var cursor = collection.find({nombre: 'Jonathan'});
    cursor.limit(10);
    cursor.skip(0);

    cursor.each(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log('User:', doc);
      }
    });


    /*
      var updateDocument = function(db, callback) {
        // Get the documents collection 
        var collection = db.collection('documents');
        // Update document where a is 2, set b equal to 1 
        collection.update({ a : 2 }
          , { $set: { b : 1 } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });  
      }
    */
    //Close connection
    //db.close();
}
});