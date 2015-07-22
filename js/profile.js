
$(document).ready(function(){
	if (!('webkitSpeechRecognition' in window) || !('RTCPeerConnection' in window)){
    	window.location = '/errorNoFeatures.html';
	}
	$("#startbutton").click(function(){
    	var roomURL = '/room=' + room + '&user=' + user + '&lang=a';
    	window.location = roomURL;
	});
});
