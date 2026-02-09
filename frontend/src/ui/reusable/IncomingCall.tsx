'use client'
import { useAuth } from '@/src/functions/auth/Store'
import { useChat } from '@/src/functions/chats/chatStore'
import React, { useEffect, useRef, useState } from 'react'
import VideoCallUI from '../chats/call/VideoCallUI'

function IncomingCall() {

    const token = useAuth((state)=> state.accessToken)
    const incomingCall = useChat((state)=> state.incomingCall)
    const setIncomingCall = useChat((state)=> state.setIncomingCall)
    
    

    const [callModal, setCallModal] = useState(false)
    const [remoteVideoActive, setRemoteVideoActive] = useState(false)
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const peerRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const roleRef = useRef<"caller" | "callee">("caller");
    const bothConnectedRef = useRef(false);

    const [inCall, setInCall] = useState(false);

    const activeId = incomingCall?.chatId



    const joinCall = async () => {
        if (inCall && !activeId) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const peer = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            peerRef.current = peer;

        
            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            // Handle incoming remote tracks
            peer.ontrack = (event) => {
                
                if (event.streams && event.streams[0]) {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setRemoteVideoActive(true);
                    }
                } else {
                    console.warn("⚠️ No stream in track event");
                }
            };

            const socket = new WebSocket(`ws://192.168.0.129:8000/ws/video/${activeId}/?token=${token}`);
            socketRef.current = socket;

            let remoteOfferSet = false;

            socket.onmessage = async event => {
                const data = JSON.parse(event.data);

                try {
                    if (data.role) {
                        roleRef.current = data.role;
                    }

                    if (data.both_connected) {
                        bothConnectedRef.current = true;

                        // Only the caller creates the offer
                        if (roleRef.current === "caller") {
                            const offer = await peer.createOffer();
                            await peer.setLocalDescription(offer);
                            
                            socket.send(JSON.stringify({ 
                                offer: {
                                    type: offer.type,
                                    sdp: offer.sdp
                                }
                            }));
                        }
                    }

                    // Handle incoming offer (callee receives this)
                    if (data.offer && roleRef.current === "callee" && !remoteOfferSet) {
                        
                        await peer.setRemoteDescription(
                            new RTCSessionDescription({
                                type: data.offer.type || "offer",
                                sdp: data.offer.sdp
                            })
                        );

                        const answer = await peer.createAnswer();
                        await peer.setLocalDescription(answer);
                        
                        socket.send(JSON.stringify({ 
                            answer: {
                                type: answer.type,
                                sdp: answer.sdp
                            }
                        }));

                        remoteOfferSet = true;
                    }

                    // Handle incoming answer (caller receives this)
                    if (data.answer && roleRef.current === "caller") {
                        
                        if (peer.signalingState === "have-local-offer") {
                            await peer.setRemoteDescription(
                                new RTCSessionDescription({
                                    type: data.answer.type || "answer",
                                    sdp: data.answer.sdp
                                })
                            );
                        } else {
                            console.warn("⚠️ Wrong signaling state for answer:", peer.signalingState);
                        }
                    }

                    // Handle ICE candidates
                    if (data.candidate) {
                        try {
                            await peer.addIceCandidate(
                                new RTCIceCandidate({
                                    candidate: data.candidate.candidate,
                                    sdpMLineIndex: data.candidate.sdpMLineIndex,
                                    sdpMid: data.candidate.sdpMid
                                })
                            );
                        } catch (e) {
                            console.warn("⚠️ Could not add ICE candidate:", e);
                        }
                    }
                } catch (error) {
                    console.error("❌ Error processing message:", error);
                }
            };

            // Send ICE candidates
            peer.onicecandidate = e => {
                if (e.candidate && bothConnectedRef.current) {
                    socket.send(JSON.stringify({ 
                        candidate: {
                            candidate: e.candidate.candidate,
                            sdpMLineIndex: e.candidate.sdpMLineIndex,
                            sdpMid: e.candidate.sdpMid
                        }
                    }));
                }
            };

            setInCall(true);
            console.log("✅ Call started");

        } catch (error) {
            console.error("❌ Error joining call:", error);
        }
    };




    const leaveCall = () => {
        setInCall(false);
        setRemoteVideoActive(false);
        bothConnectedRef.current = false;

        socketRef.current?.close();
        peerRef.current?.close();

        streamRef.current?.getTracks().forEach(track => track.stop());

        if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject = null;
        }
        
        if(localVideoRef.current){
            localVideoRef.current.srcObject = null;
        }

        socketRef.current = null;
        peerRef.current = null;
        streamRef.current = null;
        setIncomingCall(null)
        roleRef.current = "caller";

        console.log("✅ Call ended");
    };


    const handleJoinCall = () => {
        joinCall()
        setCallModal(true)
    }

    const handleLeaveCall = () => {
        setCallModal(false)
        leaveCall()
    }


    const [switchVid, setSwitchVid] = useState(false)
    const [muteSound, setMuteSound] = useState(false)
    const [connectedVid, setConnectedVid] = useState(false)

    const toggleVid = () => { setSwitchVid(!switchVid) }
    const toggleMute = () => { setMuteSound(!muteSound) }


    useEffect(()=> {
        if(remoteVideoActive && bothConnectedRef.current == true){
            setConnectedVid(true)
        }else{
            setConnectedVid(false)
        }

    }, [remoteVideoActive, bothConnectedRef.current])

    return (
        <div>
            {incomingCall?.isCalling && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white top-4 left-4 p-6 rounded-lg w-80 text-center">
						<h2 className="text-lg font-semibold">
							Incoming Call
						</h2>

						<p className="mt-2">
							{/* new guy is calling… */}
							{incomingCall.callerName} is calling…
						</p>

						<div className="flex gap-4 mt-6 justify-center">
							<button
							className="px-4 py-2 bg-green-600 text-white rounded"
							onClick={handleJoinCall}
							>
							Accept
							</button>

							<button
								className="px-4 py-2 bg-red-600 text-white rounded"
								onClick={leaveCall}
								>
								Reject
							</button>
						</div>
					</div>
				</div>
			)}

            {callModal && (
                <VideoCallUI 
                    connectedVid={connectedVid} 
                    remoteVideoRef={remoteVideoRef} 
                    switchVid={switchVid} 
                    localVideoRef={localVideoRef} 
                    toggleVid={toggleVid} 
                    toggleMute={toggleMute} 
                    handleLeaveCall={handleLeaveCall} 
                    muteSound={muteSound} 
                />
            )}
        </div>
    )
}

export default IncomingCall
