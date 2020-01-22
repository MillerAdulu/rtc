// For the app to support more than one simulataneous call,
// a different URL hash will be generated for each room

// Generate random room name if it isn't contained in the URL

const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")

if (!location.hash) {
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

const roomHash = location.hash.substring(1);

// Setup a configuration instance that will need to be passed to the RTCPeerConnection instance
// Eg. Google's public STUN server

const configuration = {
    iceServers: [{
        urls: 'stun:stun.1.google.com:19302' // Google's public STUN server
    }]
};

// Using Scaledrone as the signaling server
// Subscribe to a room, then broadcast messages sent to that room to all subscribed users
// The room name is from the URL hash
// `members` event tells who is connected to the room
// - If we are the only user in the room, the WebRTC starts and waits for an offer from another user
// - If we are the second connected user, the WebRTC starts and signal an offer to the first user
// - With three or more connected users, the room is full

// Prefix room names with `observable-`
const roomName = 'observable-' + roomHash;
let room;

// const drone = new ScaleDrone(`CHANNEL_ID_FROM_SCALEDRONE`);
const drone = new ScaleDrone(`1BTYfL9TEKbYQt4N`);

drone.on('open', error => {
    if (error) return onError(error)

    room = drone.subscribe(roomName);
    room.on('open', error => {
        if (error) onError(error)
    });

    // A connection to the room has been established and received an array of members

    room.on('members', members => {
        if (members.length >= 3) return alert('The room is full');

        // If we are the second user to connect, we shall be creating the offer
        const isOfferer = members.length === 2;
        startWebRTC(isOfferer)
        startListeningToSignals();
    })
});

let pc;

function startWebRTC(isOfferer) {
    pc = new RTCPeerConnection(configuration);

    // `onicecandidate` notifies us whenever an ICE agent needs to deliver
    // a message to the other peer through the signaling server
    pc.onicecandidate = event => {
        if (event.candidate) sendMessage({ 'candidate': event.candidate })
    }

    // If user is offerer, let the `negotiationneeded` event create the offer
    if (isOfferer) pc.onnegotiationneeded = () => {
        pc.createOffer().then(localDescCreated).catch(onError);
    }

    // When a remote stream arrives, display it in the #remoteVideo element
    pc.onaddstream = event => {
        remoteVideo.srcObject = event.stream;
        onError(event.stream)
    }

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
        onError(stream)

        // Add your stream to be sent to the connecting peer
        pc.addStream(stream);
    }, onError);
}

function startListeningToSignals() {
    room.on('data', (message, client) => {
        if (!client || client.id === drone.clientId) return;
        if (message.sdp) {
            // Called after receiving an offer or answer from another peer
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                if (pc.remoteDescription.type === 'offer') pc.createAnswer().then(localDescCreated).catch(onError);

            }, onError);
        } else if (message.candidate) {
            // Add the new ICE candidate to our connection's remote description
            pc.addIceCandidate(new RTCIceCandidate(message.candidate), onSuccess, onError);
        }
    });
}

// Gets called when creating an offer and when answering one.
// Updates the local description of the connection
function localDescCreated(desc) {
    pc.setLocalDescription(
        desc,
        () => sendMessage({ 'sdp': pc.localDescription }),
        onError
    );
}
// Sends signaling data via Scaledron to the other connection
function sendMessage(message) {
    drone.publish({
        room: roomName,
        message
    });
}

function onSuccess() { }

// Log an error to the console
function onError(error) {
    console.error(error);
}