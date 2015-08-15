$(document).ready(function(){
	var roundNumber = 1000000;
	var socket = io.connect( "http://localhost:8080");

	$("#startbutton").click(function(){
		var username = $("#username").text();
		var lang1 = $("#mainlanguage").text();
		var lang2 = $("#seclanguage").text();
  		console.log('Enviamos msg para entrar en la room: msg -- '+username+' -- '+lang1+' -- '+lang2);
  		socket.emit('room',{ username: username ,
  			lang1: lang1 ,
  			lang2: lang2});
  		//var roomURL = '/room=' + room + '&user=' + user + '&lang=a';
    	//window.location = roomURL;
	});
});
