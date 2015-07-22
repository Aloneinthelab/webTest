var socket = io();
$(document).ready(function(){
	$("#button").click(function(){
		var nick = $("#username").val();
    	var email = $("#email").val();
    	var emailconfirm = $("#emailconfirm").val();
    	var mainlanguage = $("#mainlanguage").val();
    	var languagetolearn = $("#languagetolearn").val();
    	var pass = $("#pass").val();
    	var passconfirm = $("#passconfirm").val();

    	if(nick && email && emailconfirm && mainlanguage && languagetolearn && pass && passconfirm){
    		if(email == emailconfirm){
    			if(pass == passconfirm){
                    //hacerle la hash a la pass para guardarla en al base de datos
                    //comprobar antes si el nick existe, TIENE QUE SER UNICO
    				socket.emit('newRegister',nick,email,mainlanguage,languagetolearn,pass);
    			}else{
    				$("#state").text("Passwords incorrects");
    			}
    		}else{
    			$("#state").text("Confirma correctamente tu email");
    		}
    	}else{
    		$("#state").text("Please complete all");
    	}

	});
	
});