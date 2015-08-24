$(document).ready(function(){
  if(url.indexOf("localhost")>-1){
    var socket = io.connect("http://localhost:8080");
  }else if(url.indexOf("herokuapp")>-1){
    var socket = io.connect("http://aloneinthelab-web-test.herokuapp.com:8080");
  }
  var level = $("#level").text();
  var mainlanguage = $("#mainlanguage").text();
  	socket.emit('message',{
      type: 'db' ,
      level: level ,
      language: mainlanguage});
    
  	socket.on('topic',function (msg){
      $("#topic").text(msg);
    });

});