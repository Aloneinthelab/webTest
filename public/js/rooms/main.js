'use strict';

var isChannelReady;
var isInitiator = false;
var isStarted = false;
var isRecognitionStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var out = false;
var preUtt="";

var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

var PC_CONFIG = {
  'iceServers': [
    {
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=udp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=tcp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    }
  ]
};

var room = location.pathname.split('&user=')[0].split('room=')[1];

var username = location.pathname.split('&user=')[1].split('&lang=')[0];

var langSelected = location.pathname.split('&lang=')[1];


var localtag = document.getElementById("localtag");
localtag.innerHTML=username;

if (room === '') {

  room = 'Por defecto';
}

//var socket = io.connect();
var url = window.location.href;
if(url.indexOf("localhost")>-1){
    var socket = io.connect("http://localhost:8080");
}else if(url.indexOf("herokuapp")>-1){
    var socket = io.connect("http://aloneinthelab-web-test.herokuapp.com:8080");
}

if (room !== '') {
  console.log('Intentando entrar', room);
  socket.emit('sign in',username, room);

}

////////////////////////////////////MSGS FROM THE PEER////////////////////////

var msgInfo = document.getElementById("msg");
var remoteUsername;

socket.on('created', function (room){
  console.log('Room creada ' + room);
  isInitiator = true;
});

socket.on('full', function (room){
  console.log(room + ' esta llena');
});

socket.on('join', function (room){
  console.log('Alguien intenta entrar en ' + room);
  isChannelReady = true;
});

socket.on('joined', function (room){
  console.log('Alguien ha entrado ' + room);

  isChannelReady = true;
});

socket.on('username used', function(room){
  console.log('Ya hay alguien con este nombre');

    alert("Ya hay alguien con " + username + " como nombre de usuario en esta sala");


});

socket.on('full room', function(room){
  console.log('Sala llena');

    alert('Esta sala ya está llena');


});

socket.on('end',function(message){
  console.log("me voy");

  if(!out){
    sendMessage({
              type: 'end'}
            );
  }


  msgInfo.innerHTML=remoteUsername + " se ha ido de la sala";

  out = true;
  hangup();
});


socket.on('translation', function (message){
  console.log("trans " + message.text);
  if(isSubtitlesEnabled){
    subtitles.innerText = "";
    subtitles.innerText = message.text;
  }

  if(isUtteranceEnabled){

    var utterance = new SpeechSynthesisUtterance();
    utterance.text = message.text;
    utterance.lang = langSelected;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
});

socket.on('message', function (message){

  if (message.text === 'got user media' ) {
    maybeStart();
    sendMessage({
          type: 'username',
          username: username}
        );
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
      sendMessage({
          type: 'username',
          username: username}
        );
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));

  } else if (message.type === 'candidate' && isStarted) {

    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);

  } else if (message === 'bye' && isStarted) {

    handleRemoteHangup();

  }else if(message.type === 'speech'){

    if(!isUtteranceEnabled && !isSubtitlesEnabled ){
      if(langSelected == "es"){
        msgInfo.innerHTML=remoteUsername + " te está hablando, activa los subtítulos o el audio";
      }else{
        msgInfo.innerHTML=remoteUsername + " is talking to you, enable voice or subtitles";
      }
    }

    handleSpeech(message);
  }else if(message.type === 'username'){
    var remotetag = document.getElementById("remotetag");
    remotetag.innerHTML=message.username;
    remoteUsername=message.username;
  }
});

///////////////////////////////  INFO  ////////////////////////////

var info =  document.getElementById("info");
var init =  document.getElementById("init");

////////////////// JQUERY BOOTSTRAP/////////////////

$('#speech').tooltip();
$('#utterance').tooltip();
$('#translate').tooltip();
$('#subtitle').tooltip();



///////////////////////////////FUNCTION FOR SENDMESSAGE//////////////////////

function sendMessage(message){
  if(message.type === 'offer'){

    var msg = {
      type: 'offer',
      msg: message,
      room: room,
      user: username
    }

    socket.emit('message', msg);
  }else if(message.type === 'answer'){

    var msg = {
      type: 'answer',
      msg: message,
      room: room,
      user: username
    }

    socket.emit('message', msg);

  }else{
    message.room = room;
    message.user = username;

    socket.emit('message', message);
  }

}

/////////////////////GET USER MEDIA FUNCTIONS///////////////////

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

function handleUserMedia(stream) {
  console.log('Añadiendo stream local');
  localVideo.src = window.URL.createObjectURL(stream);
  localStream = stream;
  sendMessage({
              text: 'got user media'});
  maybeStart();
}

function handleUserMediaError(error){
  console.log('getUserMedia error: ', error);
}

var constraints = {audio:true};
getUserMedia(constraints, handleUserMedia, handleUserMediaError);

//////////////////RTCPEERCONNECTION FUNCTIONS//////////////////////7


function maybeStart() {
  if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;

    console.log('isInitiator', isInitiator);

    if (isInitiator) {
      doCall();

    }
  }
}

window.onbeforeunload = function(e){
  sendMessage('bye');
}

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(PC_CONFIG);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
  } catch (e) {
    console.log('Error RTCPeerConnnection ' + e.message);
      return;
  }
}

function handleIceCandidate(event) {
  console.log('handleIceCandidate : ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Insertado stream remoto');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;
}

function handleCreateOfferError(event){
  console.log('createOffer() error: ', e);
}

function doCall() {
  console.log('Mandando oferta');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Mandando respuesta');
  pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage envia' , sessionDescription);
  sendMessage(sessionDescription);

}

function handleRemoteStreamAdded(event) {
  console.log('Stream remoto añadido');
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  remoteStream = event.stream;

}

function handleRemoteStreamRemoved(event) {
  console.log('stream remoto eliminado: ', event);
}

function hangup() {
  console.log('Colgando');
  stop();
}

function handleRemoteHangup() {
  console.log('El usuario remoto ha colgado');
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}




///////////////////////////////////////////////GO OUT FROM THE ROOM

var close = document.getElementById("endComunication");

close.addEventListener("click",returnToIndex,false);

window.addEventListener("beforeunload",goOutFromRoom, false);

function returnToIndex(){
  goOutFromRoom();

  window.location.href = "/index.html";
}

function goOutFromRoom(){
  if(!out){
    sendMessage({
              type: 'end'}
            );
  }

  if(typeof pc != 'undefined' && pc != null){
      hangup();
  }
  out = true;
}

sendMessage({
      type: 'username',
      username: username}
    );
