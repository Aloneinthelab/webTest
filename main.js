var socket = io();
$(document).ready(function(){
	$("#button").click(function(){
		var nick = $("#nick").val();
    	var pass = $("#pass").val();
    	if(nick && pass){
      		socket.emit('log in',nick,pass);
    	}
	});
});
