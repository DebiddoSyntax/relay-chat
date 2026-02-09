"use client"
import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { useEffect, useRef, useState } from 'react'
import { IoVideocam } from "react-icons/io5";
import { useChat } from '@/src/functions/chats/chatStore';
import { ImPhoneHangUp } from "react-icons/im";
import { MdCameraswitch } from "react-icons/md";
import { HiSpeakerWave } from "react-icons/hi2";
import { HiSpeakerXMark } from "react-icons/hi2";





function VideoCall({ activeId }: { activeId?: number | null}) {
       
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

    const currentId = activeId ? activeId : incomingCall?.chatId

    const joinCall = async () => {
        if (inCall && !activeId) return;
        setIncomingCall((prev) => prev ? { ...prev, calling: false } : prev);

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

            const socket = new WebSocket(`ws://192.168.0.129:8000/ws/video/${currentId}/?token=${token}`);
            socketRef.current = socket;

            let remoteOfferSet = false;

            socket.onmessage = async event => {
                const data = JSON.parse(event.data);
                console.log('video', data)

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
            handleLeaveCall()
        }
    };




    const leaveCall = () => {
        setInCall(false);
        setIncomingCall(null)
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
            {activeId && <IoVideocam className='text-2xl cursor-pointer' onClick={handleJoinCall} />}

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
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className="relative w-[60%] h-[80%] bg-black rounded-xl overflow-hidden py-24">
        
                        <div className="absolute flex items-center gap-6 top-4 left-4 px-4 py-2">
                            <p className={`${connectedVid ? 'text-green-500' : 'text-blue-700'}`}>
                                {connectedVid ? 'connected' : 'connecting...'}
                            </p>
                            {/* <p className={`${remoteVideoActive && bothConnectedRef.current == true ? 'text-green-500' : 'text-blue-700'}`}>
                                {remoteVideoActive && bothConnectedRef.current == true ? 'connected' : 'connecting...'}
                            </p> */}
                        </div>
        
                        {/* Video stage */}
                        <div className="relative w-full h-full bg-black">
        
                            {/* Remote video */}
                            <video ref={remoteVideoRef} autoPlay playsInline
                                className={`object-cover transition-all duration-300 ${switchVid
                                    ? "absolute bottom-4 right-4 w-[180px] h-[280px] rounded-xl shadow-lg"
                                    : "w-full h-full" }`}
                            />
        
                            {/* Local video */}
                            <video ref={localVideoRef} autoPlay playsInline muted
                                className={`object-cover transition-all duration-300 ${switchVid
                                    ? "w-full h-full"
                                    : "absolute bottom-4 right-4 w-[180px] h-[280px] rounded-xl shadow-lg"}`}
                            />
        
                        </div>
        
                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 bg-white py-5">
        
                            <button onClick={toggleVid} className="flex items-center justify-center bg-blue-700 text-white w-16 h-16 rounded-full text-2xl cursor-pointer">
                                <MdCameraswitch />
                            </button>
        
                            <button onClick={handleLeaveCall} className="flex items-center justify-center bg-red-700 text-white w-16 h-16 rounded-full text-2xl cursor-pointer">
                                <ImPhoneHangUp />
                            </button>
        
                            <button onClick={toggleMute} className="flex items-center justify-center bg-blue-700 text-white w-16 h-16 rounded-full text-2xl cursor-pointer">
                                {muteSound ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                            </button>
        
                        </div>
                    </div>
                </div>
            )}

                
        </div>
    )
}

export default VideoCall