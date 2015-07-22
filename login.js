var socket = io();
var authOK = true;
$(document).ready(function(){
	$("#button").click(function(){
		var nick = $("#nick").val();
    	var pass = $("#pass").val();
    	if(nick && pass){
      		socket.emit('log in',nick,pass);
    	}

    	//Aqui iria la autenticación

    	if(authOK){
            alert("vamos a indexroom");
    		window.location.href="/indexRoom";
    	}
	});
});
