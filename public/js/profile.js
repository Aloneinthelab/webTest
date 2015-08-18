$(document).ready(function(){
	var roundNumber = 1000000;
  var url = window.location.href;

  if(url.indexOf("localhost")>-1){
    var socket = io.connect("http://localhost:8080");
  }else if(url.indexOf("herokuapp")>-1){
    var socket = io.connect("http://aloneinthelab-web-test.herokuapp.com:8080");
  }
	$("#startbutton").click(function(){
		var username = $("#username").text();
		var lang1 = $("#mainlanguage").text();
		var lang2 = $("#seclanguage").text();
  		console.log('Enviamos msg para entrar en la room: msg -- '+username+' -- '+lang1+' -- '+lang2);
  		socket.emit('room',{ username: username ,
  			lang1: lang1 ,
  			lang2: lang2});

  		socket.on('roomNumber',function (msg){
    		console.log("Recibido numero de room: " + msg);
    		var roomURL = '/room=' + msg + '&user=' + username + '&lang=a';
   		  window.location = roomURL;
    	});
	});
});
