# WebRTC

## What is WebRTC?
```
- A collection of communications protocols and APIs that enable real-time peer to peer connections across the internet.
- Useful for multiplayer games, chat, video and voice conferences, file sharing
```

## WebRTC Terms
### Signaling
```
- It's the discovery and negotiation process of WebRTC peers.
- Two devices in different networks find each other using a central service called a signalling server.
- Two devices can discover each other and exchange negotiation messages
- Technologies such as Websockets can be employed for signalling
```

### ICE Candidates
```
- ICE stands for Interactive Connectivity Establishment
- Two peers exchange ICE candidates until they find a method of communication that they both support
- After the connection established ICE candidates can be traded again to upgrade to a better and faster communication method
```

### STUN Server
```
- STUN stands for Session Traversal Utilities for NAT
- Used to get an external network address and to pass firewalls
```

### RTCPeerConnection
A instance that represents a WebRTC connection between the local computer and a remote peer

#### RTC Event Handling
- `onicecandidate`: Returns locally generated ICE candidates for signaling to other users. Passed to our signaling service
- `onnegotiationneeded`: Triggered when a change has occured which requirs session negotiation. Starts off the createOffer process and is only handled by the user that is an offerer
- `onaddstream`: Returns the remote video and audio stream of the remote user. Set as the source of the remote video element