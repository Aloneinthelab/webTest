
var err = 'La contraseña no cooincide'; 


function checkForm()
{
	var form = document.getElementById('signupForm');
    var pass = document.getElementById('pass').value;
    var passConfirm = document.getElementById('passconfirm').value;
    //Mirar la longitud de la pass

    if (pass == passConfirm){
    	form.submit();
    }else{
    	throw err;
    }


}