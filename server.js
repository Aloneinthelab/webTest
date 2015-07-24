var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));
//app.use(express.static('public'));

server.listen(5000);

// respond with "hello world" when a GET request is made to the homepage

var dbConfig = require('./passport/db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

// Configuring Passport

var passport = require('passport');
var expressSession = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
require('./passport/model/user');
require('./passport/model/Post');
require('./passport/model/Comment');

app.use(expressSession(
  {secret: 'mySecretKey',
  proxy: true,
  resave: true,
  saveUninitialized: true}
  ));
app.use(passport.initialize());
app.use(passport.session());
// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());
var initPassport = require('./passport/init');
initPassport(passport);

var routesFunction = require('./passport/routes/index')
var routes = routesFunction(passport);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/login.html');
});
app.get('/signup', function(req, res) {
  res.sendFile(__dirname + '/signup.html');
});
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
/*var mongodb = require('mongodb');
var dbConfig = require('./passport/db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);


// Configuring Passport

var passport = require('passport');
var express = require('express');
var expressSession = require('express-session');
var appPas = express();
var LocalStrategy = require('passport-local').Strategy;
require('./passport/model/user');
require('./passport/model/Post');
require('./passport/model/Comment');

appPas.use(expressSession(
  {secret: 'mySecretKey',
  proxy: true,
  resave: true,
  saveUninitialized: true}
  ));
appPas.use(passport.initialize());
appPas.use(passport.session());
// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
appPas.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

//Create Routes
var routesFunction = require('./passport/routes/index')
var routes = routesFunction(passport);

var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var app = http.createServer(function (req, res) {
  if(req.url === '/'){
    file.serveFile('/index.html', 200, {}, req, res);
  }else if(req.method === "POST") {
    if (req.url === "/login") {
      console.log("manejando post de login");
      passport.authenticate('login', {
        successRedirect: '/index',
        failureRedirect: '/login',
        failureFlash : true 
      });
    }else if(req.url === "/signup"){
      console.log("manejando post de singup");
      passport.authenticate('signup', {
        successRedirect: '/index',
        failureRedirect: '/signup',
        failureFlash : true 
      });
    }
  }else if(req.url === '/login'){
    file.serveFile('/login.html', 200, {}, req, res);
  }else if (req.url.substring(1, 6) === 'room=') {
    file.serveFile('/room.html', 200, {}, req, res);
  }else if(req.url === '/profile'){
    file.serveFile('/profile.html', 200, {}, req, res);
  }else if(req.url === '/indexRoom'){
    file.serveFile('/indexRoom.html', 200, {}, req, res);
  }else if(req.url === '/signup'){
    file.serveFile('/signup.html', 200, {}, req, res);
  }else if(req.url === '/about'){
    file.serveFile('/about.html', 200, {}, req, res);
  } else {
      file.serve(req, res, function(error, errorRes) {
          if (error && (error.status === 404)) {
                file.serveFile('/nofichero.html', 404, {}, req, res);
            }
        });
    }
}).listen(process.env.PORT || 5000);*/


var numClients = 0;
var rooms = {};

///INICIO SERVIDOR

//var io = require('socket.io').listen(app);


io.sockets.on('connection', function (socket){

  var clientAddress = socket.handshake.address;

  socket.on('sign in', function (username, room) {

    if (!username || !room) {
            console.log('$ Error en los parametros');
            socket.disconnect();
        } else {
            console.log('$ El usuario' + username, +' quiere entrar en la sala ' + room);
            //Se crea la room si no esta creada
            if (rooms[room] === undefined) {
                console.log('$ La sala ' + room  + 'ha sido creada');
                rooms[room] = {};
                socket.join(room);
                socket.emit('created', room);
                rooms[room][username] = socket;
                rooms[room]['nusers'] = 1;

            } else if (Object.keys(rooms[room]).indexOf(username) !== -1) {// mirar si el usuario esta dentro de la room
                console.log('$ El nombre de usuario ' + username + ' ya se está usando en la sala ' + room);
                socket.emit('username used', username, room);
                socket.disconnect();

            } else {

                if(rooms[room]['nusers'] ==1){
                    console.log('$ El  usuario '+ username + ' ha entrado en la sala ' + room);
                    io.sockets.in(room).emit('join', username, room);
                    socket.join(room);
                    socket.emit('joined', room, Object.keys(rooms[room]));
                    rooms[room][username] = socket;
                    rooms[room]['nusers'] ++;
                    console.log(rooms);

                }else{
                    socket.emit('full room', username, room);
                    console.log('$ La sala ' + room + ' está llena');
                }

            }
        }
    });


  socket.on('message', function (message) {
    console.log('message: ', message.room , message.type);
    if(message.type === 'db'){

                //aqui iria lo de base de datos

    }else{

      if(message.type == 'end'){
        console.log(message);
        delete rooms[message.room][message.user];

        rooms[message.room]['nusers'] --;

        if(rooms[message.room]['nusers'] == 0){
          delete rooms[message.room];
        }else{
          console.log("sending end message");
          socket.broadcast.to(message.room).emit('end', message);
        }
        socket.leave(message.room);
        console.log(rooms);
      }

      if(message.type === 'offer' || message.type === 'answer'){
        socket.broadcast.to(message.room).emit('message', message.msg);
      }else{
        socket.broadcast.to(message.room).emit('message', message);
      }

    }


  });

  socket.on('profile', function(nick,pass){
    console.log('message: ' + nick + " -- " + pass);
  });

  socket.on('update', function(nick,pass){
    console.log('message: ' + nick + " -- " + pass);
  });

});








/*

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
*/
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

/*
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

    */
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
//}
//});