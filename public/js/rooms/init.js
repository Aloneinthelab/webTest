// Feature testing.
// Redirects to an information page if the browser doesn't support the required APIs
if (!('webkitSpeechRecognition' in window) || !('RTCPeerConnection' in window)){
    window.location = '/errorNoFeatures.html';
}
var goButton = document.getElementById('goButton');
var roomname = document.getElementById('room');
var username = document.getElementById('user');

goButton.disable = false;
goButton.onclick = vchat;


function vchat(room)
{
    room = roomname.value;
    user = username.value;

    var roomURL = '/room=' + room + '&user=' + user + '&lang=a';

    window.location = roomURL;

}
