// server.js

var express  = require('express')
var app      = express();
var port     = process.env.PORT || 5000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var path = require('path');
var usersArray = [];


var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ 
  secret: 'aloneinthelab',
  proxy: true,
  resave: true,
  saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch =====================================================================

app.listen(port);
console.log('The magic happens on port ' + port);

var http = require( "http" ).createServer(app);
var io = require( "socket.io" )(http);
http.listen(8080);

var numClients = 0;
var rooms = {};

///INICIO SERVIDOR

io.on('connection', function (socket){
  var clientAddress = socket.handshake.address;
  console.log("Client connected");
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

  socket.on('room', function (data){
    console.log('message: ' + data.username + " -- " + data.lang1 + " -- " + data.lang2);
    var roundNumber = 1000000;
    var randRoom = Math.round((Math.random() * roundNumber));

    roomNumber = searchUser(data.lang1,data.lang2);
    if(roomNumber!=0){        //if we find the User we send the number of room
      console.log("RoomNumber: "+ roomNumber);
      socket.join(roomNumber);
      socket.emit('roomNumber', roomNumber);
      socket.to(roomNumber).emit('roomNumber', roomNumber);
    }else{                    //if not we add the user
      var user = {username:data.username, lang1:data.lang1, lang2:data.lang2, roomNumber:randRoom, state:'on'};
      usersArray.push(user);
      socket.join(randRoom);
      console.log("Adding user and create a room");
    }
  });
});


function searchUser(lang1,lang2) {
  for (var index = 0; index < usersArray.length; index++) {
    if(lang1 == usersArray[index].lang2 && lang2 == usersArray[index].lang1  && usersArray[index].state == 'on'){
      usersArray[index].state = 'off';
      return usersArray[index].roomNumber;
    }
  }
  return 0;
}


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