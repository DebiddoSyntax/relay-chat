"use client"
import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { useEffect, useReducer, useRef, useState } from 'react'
import { useChat } from '@/src/functions/chats/chatStore';
import { ImPhoneHangUp } from "react-icons/im";
import { MdCameraswitch } from "react-icons/md";
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2";
import { FaUserCircle } from "react-icons/fa";
import { IoClose, IoVideocam } from "react-icons/io5";
import { IoMdMicOff, IoMdMic } from "react-icons/io";
import { FaPhone } from "react-icons/fa6";

type ActionType =
  | { type: "TOGGLE"; field: keyof CallStateType }
  | { type: "RESET" };


interface CallStateType {
    callModal: boolean
    remoteVideoActive: boolean
    remoteAudioActive: boolean
    switchVid: boolean
    muteSound: boolean
    muteMic: boolean
    failedCall: boolean
    connectedVid: boolean
    inCall: boolean
};

const initialState: CallStateType = {
    callModal: false,
    remoteVideoActive: false,
    remoteAudioActive: false,
    switchVid: false,
    muteSound: false,
    muteMic: false,
    failedCall: false,
    connectedVid: false,
    inCall: false,
};

function ToggleReducer(state: CallStateType, action: ActionType) {
    switch (action.type) {
        case "TOGGLE":
            return { ...state, [action.field]: !state[action.field] };
        case "RESET":
            return {...initialState};
        default:
            return state;
    }
}


interface FailedStateType {
    failed: boolean
    failedMessage: string
}


function Call({ activeId, isAudio }: { activeId?: number | null, isAudio: boolean | null}) {
       
    const incomingCall = useChat((state)=> state.incomingCall)
    const setIncomingCall = useChat((state)=> state.setIncomingCall)
    const setActiveCall = useChat((state)=> state.setActiveCall)
    const activeCall = useChat((state)=> state.activeCall)

    const [state, dispatch] = useReducer(ToggleReducer, initialState);
    const [fail, setFail] = useState<FailedStateType | null>(null)

    const toggle = (field: keyof typeof initialState) => dispatch({ type: "TOGGLE", field });
    const resetStates = () => dispatch({ type: "RESET"});

    const currentId = activeId ? activeId : incomingCall?.chatId

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const roleRef = useRef<"caller" | "callee">("caller");
    const bothConnectedRef = useRef(false);
    const callCleanedUpRef = useRef(true); 
    const unansweredTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inCallRef = useRef(false);


    const socketURL = process.env.NEXT_PUBLIC_BASE_SOCKET_URL


    const refreshAccess = async () => {
        try {
            const res = await api.post(`/auth/refresh/`);
            const newToken = res.data.accessToken;
            useAuth.setState({ accessToken: newToken });
            console.log('refreshed and added, websocket')
            return newToken;
        } catch (e) {
            console.log('failed to refresh token', e)
            setFail({failed: true, failedMessage: 'Call failed'})
            return;
        } 
    }

  
    const cleanupCall = async () => {
        console.log("🧹 Starting cleanup...");

        // Stop all media tracks first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`  Stopped ${track.kind} track`);
            });
            streamRef.current = null;
        }

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }

        if (unansweredTimeoutRef.current) {
            clearTimeout(unansweredTimeoutRef.current);
            unansweredTimeoutRef.current = null;
        }

        // Close peer connection
        if (peerRef.current) {
            // Remove all senders
            const senders = peerRef.current.getSenders();
            for (const sender of senders) {
                try {
                    await peerRef.current.removeTrack(sender);
                } catch (e) {
                    console.warn("⚠️ Error removing track:", e);
                }
            }
            peerRef.current.close();
            peerRef.current = null;
        }

        // Close socket
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        // Reset refs
        bothConnectedRef.current = false;
        inCallRef.current = false;
        roleRef.current = "caller";
        callCleanedUpRef.current = true;

        // console.log("✅ Cleanup complete");
    };


    const setInCall = (val: boolean) => {
        inCallRef.current = val;
        if (val !== state.inCall) toggle('inCall');
    };


    const joinCall = async () => {
        if (state.inCall && !activeId) return;

        if(activeCall){
            setFail({failed: true, failedMessage: 'User on a call' })
            return
        }
        
        if (!callCleanedUpRef.current) {
            let attempts = 0;
            while (!callCleanedUpRef.current && attempts < 50) {
                await new Promise(r => setTimeout(r, 50));
                attempts++;
            }
        }

        callCleanedUpRef.current = false;
        
        setIncomingCall((prev) => prev ? { ...prev, isCalling: false } : prev);

        try {
            
            await cleanupCall();

            await refreshAccess()

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true,
            });

            streamRef.current = stream;
            if (!isAudio && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            if (isAudio && localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            const peer = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" }
                ],
            });

            peerRef.current = peer;

            stream.getTracks().forEach((track, index) => {
                peer.addTrack(track, stream);
            });

            // Handle incoming remote tracks
            peer.ontrack = (event) => {
                if (!isAudio && event.streams && event.streams[0]) {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        toggle('remoteVideoActive')
                    }
                } else if(isAudio && event.streams && event.streams[0]) {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                        toggle('remoteAudioActive')
                    }
                } else {
                    console.warn("⚠️ No stream in track event");
                }
            };


            const socket = new WebSocket(`${socketURL}/video/${currentId}/?audio=${isAudio}`);
            socketRef.current = socket;

            let remoteOfferSet = false;

            socket.onmessage = async event => {
                const data = JSON.parse(event.data);

                console.log('global', data)
                
                if (data.type === 'error') {
                    console.log(`❌ ${data.error}: ${data.message}`);
                    
                    // handle token expiration 
                    if (data.error === 'token_expired') {
                        try{
                            await refreshAccess()
                        }catch(err){
                            return;
                        }
                    }
                       
                }

                if (data.type === 'connection' && data.status === 'connected') {
                    console.log('call socket connected')
                }

                try {
                    if (data.role) {
                        roleRef.current = data.role;
                    }

                    if (roleRef.current === "caller") {
                        unansweredTimeoutRef.current = setTimeout(() => {
                            if (!bothConnectedRef.current) {
                                console.log("⏰ No answer. Ending call.");
                                handleLeaveCall();
                            }
                        }, 20000);
                    }


                    if (data.both_connected) {
                        bothConnectedRef.current = true;
                        if (unansweredTimeoutRef.current) {
                            clearTimeout(unansweredTimeoutRef.current);
                            unansweredTimeoutRef.current = null;
                        }

                        if (!inCallRef.current) setInCall(true);


                        if (roleRef.current === "caller" && peerRef.current && peerRef.current.signalingState !== "closed") {
                            try {
                                
                                const offer = await peerRef.current.createOffer({
                                    offerToReceiveAudio: true,
                                    offerToReceiveVideo: true
                                });

                                await peerRef.current.setLocalDescription(offer);
                                
                                socket.send(JSON.stringify({ 
                                    offer: {
                                        type: offer.type,
                                        sdp: offer.sdp
                                    }
                                }));
                            } catch (e) {
                                console.error("❌ Error creating/sending offer:", e);
                                toggle('failedCall');
                                setFail({failed: true, failedMessage: 'Error creating/sending offer' })
                            }
                        }
                    }

                    if (data.offer && roleRef.current === "callee" && !remoteOfferSet && peerRef.current && peerRef.current.signalingState !== "closed") {
                        try {
 
                            await peerRef.current.setRemoteDescription(
                                new RTCSessionDescription({
                                    type: data.offer.type || "offer",
                                    sdp: data.offer.sdp
                                })
                            );

                            const answer = await peerRef.current.createAnswer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            });
                            await peerRef.current.setLocalDescription(answer);
                            
                            socket.send(JSON.stringify({ 
                                answer: {
                                    type: answer.type,
                                    sdp: answer.sdp
                                }
                            }));

                            remoteOfferSet = true;
                        } catch (e) {
                            console.error("❌ Error processing offer/answer:", e);
                            toggle('failedCall');
                            setFail({failed: true, failedMessage: 'Error processing offer/answer' })
                        }
                    }

                    if (data.answer && roleRef.current === "caller" && peerRef.current && peerRef.current.signalingState !== "closed") {
                        try {
                            if (peerRef.current.signalingState === "have-local-offer") {
                                await peerRef.current.setRemoteDescription(
                                    new RTCSessionDescription({
                                        type: data.answer.type || "answer",
                                        sdp: data.answer.sdp
                                    })
                                );
                            } else {
                                console.warn("⚠️ Wrong signaling state for answer:", peerRef.current.signalingState);
                                toggle('failedCall');
                                setFail({failed: true, failedMessage: 'Wrong signaling state for answer' })
                            }
                        } catch (e) {
                            console.error("❌ Error setting remote description:", e);
                            toggle('failedCall');
                            setFail({failed: true, failedMessage: 'Error setting remote description' })
                        }
                    }

                    // Handle ICE candidates
                    if (data.candidate && peerRef.current && peerRef.current.signalingState !== "closed") {
                        try {
                            await peerRef.current.addIceCandidate(
                                new RTCIceCandidate({
                                    candidate: data.candidate.candidate,
                                    sdpMLineIndex: data.candidate.sdpMLineIndex,
                                    sdpMid: data.candidate.sdpMid
                                })
                            );
                        } catch (e) {
                            console.warn("⚠️ Could not add ICE candidate:", e);
                            toggle('failedCall');
                            setFail({failed: true, failedMessage: 'Could not add ICE candidate' })
                        }
                    }

                    if (data.user_left) {
                        // console.log("👤 Other user left the call:", data);
                        handleLeaveCall()
                    }
                } catch (error) {
                    console.error("❌ Error processing message:", error);
                    toggle('failedCall');
                    setFail({failed: true, failedMessage: 'Error processing message' })
                }
            };
            

            // Send ICE candidates - verify everything is ready
            peer.onicecandidate = (e) => {
                if (e.candidate && bothConnectedRef.current && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    try {
                        socketRef.current.send(JSON.stringify({ 
                            candidate: {
                                candidate: e.candidate.candidate,
                                sdpMLineIndex: e.candidate.sdpMLineIndex,
                                sdpMid: e.candidate.sdpMid
                            }
                        }));
                    } catch (err) {
                        console.error("❌ Error sending ICE candidate:", err);
                    }
                }
            };

            toggle('inCall');
            
            callCleanedUpRef.current = false; 

        } catch (error) {
            console.error("❌ Error joining call:", error);
            await cleanupCall();
            handleLeaveCall()
        }
    };
    


    const leaveCall = async () => {
        // console.log("📞 Leaving call...");
        
        // Send disconnect notification to the other peer
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            try {
                socketRef.current.send(JSON.stringify({ 
                    disconnect: true,
                    message: "User left the call",
                    role: roleRef.current
                }));
            } catch (error) {
                console.error("❌ Error sending disconnect notification:", error);
            }
            
            // Give it a moment to send before closing
            setTimeout(() => {
                socketRef.current?.close();
            }, 100);
        }

        // Clean up everything
        await cleanupCall();

        // Reset all states after cleanup
        resetStates();
        setIncomingCall(null);

        console.log("✅ Call ended");
    };


    const handleJoinCall = () => {
        joinCall()
        toggle('callModal')
    }


    const handleLeaveCall = async () => {
        await leaveCall()
    }

    
    const toggleMuteVid = () => {
        if(isAudio){
            const audio = remoteAudioRef?.current
            if (!audio) return
            audio.muted = !audio.muted
        }else{
            const vid = remoteVideoRef?.current
            if (!vid) return
            vid.muted = !vid.muted
        }
        toggle('muteSound')
    }
    

    const toggleMuteMic = () => {
        const audio = streamRef?.current?.getAudioTracks()[0]
        if (!audio) return
        audio.enabled = !audio.enabled
        toggle('muteMic')
    }


    const IconToShow = isAudio ? FaPhone : IoVideocam

    return (
        <div>
            {activeId && <IconToShow className={`${isAudio ? 'text-base' : 'text-2xl'} cursor-pointer`} onClick={handleJoinCall} />}

            {incomingCall?.isCalling && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="flex items-start justify-between gap-8 bg-white top-4 left-4 p-4 md:p-6 rounded-lg w-auto">
                        <div className="flex gap-3 mt-0">
                            {incomingCall?.image_url ? 
                                <img src={incomingCall?.image_url} alt='user image' className='w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full' /> 
                                : 
                                <FaUserCircle className='w-20 h-20 rounded-full'/>
                            }
                            
                            <div className='flex flex-col gap-3 items-start'>
                                <p className="mt-0 text-base md:text-lg font-semibold">
                                    {incomingCall.callerName}
                                </p>
                                <p className="mt-0 text-xs md:text-sm font-semibold text-gray-600">
                                    {incomingCall.isAudio ? 'Incoming voice call' : 'Incoming video call'}
                                </p>
                            </div>
                        </div>

						<div className="flex gap-3 md:gap-4 mt-0">
							<button onClick={handleJoinCall} className="flex items-center justify-center bg-primary text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                <ImPhoneHangUp />
                            </button>

							<button onClick={handleLeaveCall} className="flex items-center justify-center bg-red-700 text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                <ImPhoneHangUp />
                            </button>
						</div>
					</div>
				</div>
			)}


            {state.callModal && (
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className="relative h-full w-full flex justify-center">
                        {fail?.failed ? (
                            <div className='relative w-80 h-40 bg-white rounded-xl m-auto p-3'>
                                <div className='flex justify-end'>
                                    <IoClose className=' text-2xl text-black cursor-pointer' onClick={handleLeaveCall}/>
                                </div>
                                <p className='mt-7 text-lg font-semibold text-red-700 text-center'>{fail.failedMessage}</p>
                                {/* <p>Failed to start call</p> */}
                            </div>
                        ) : (
                            <div className="relative w-[90%] md:w-[80%] xl:w-[60%] h-[80%] bg-black rounded-xl overflow-hidden pt-18 md:pt-20 pb-20 md:pb-24 m-auto">
                                <div className="absolute flex items-center gap-6 top-4 left-4 px-4 py-2">
                                    <p className={`${bothConnectedRef.current == true ? 'text-green-500' : 'text-primary'}`}>
                                        {bothConnectedRef.current == true ? 'connected' : 'connecting...'}
                                    </p>
                                </div>
                
                                {/* Video stage */}
                                <div className="relative w-full h-full bg-black">
                
                                    {/* Remote video */}
                                    {!isAudio ? 
                                        <video ref={remoteVideoRef} autoPlay playsInline
                                            className={`object-cover transition-all duration-300 ${state.switchVid
                                                ? "absolute bottom-4 right-4 w-[120] md:w-[180px] h-[180px] md:h-[280px] rounded-xl shadow-lg"
                                                : "w-full h-full" }`}
                                        />
                                    :

                                        <audio ref={remoteAudioRef} autoPlay playsInline
                                            style={{ display: 'none' }}
                                        />
                                    }
                
                                    {/* Local video */}
                                    {!isAudio ? 
                                        <video ref={localVideoRef} autoPlay playsInline muted
                                            className={`object-cover transition-all duration-300 ${state.switchVid
                                                ? "w-full h-full"
                                                : "absolute bottom-4 right-4 w-[120] md:w-[180px] h-[180px] md:h-[280px] rounded-xl shadow-lg"}`}
                                        />
                                        :
                                        <audio ref={localAudioRef} autoPlay muted playsInline
                                            style={{ display: 'none' }} 
                                        />
                                    }
                
                                </div>
                
                                {/* Controls */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 bg-white py-5">
                
                                    <button onClick={handleLeaveCall} className="flex items-center justify-center bg-red-700 text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                        <ImPhoneHangUp />
                                    </button>
                
                                    {!isAudio && 
                                        <button onClick={()=> toggle('switchVid')} className="flex items-center justify-center bg-primary text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                            <MdCameraswitch />
                                        </button>
                                    }
                
                                    <button onClick={()=> toggleMuteVid()} className="flex items-center justify-center bg-primary text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                        {state.muteSound ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                                    </button>
                                    <button onClick={()=> toggleMuteMic()} className="flex items-center justify-center bg-primary text-white w-12 md:w-14 xl:w-16 h-12 md:h-14 xl:h-16 rounded-full text-2xl cursor-pointer">
                                        {state.muteMic ? <IoMdMicOff /> : <IoMdMic />}
                                    </button>
                
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

                
        </div>
    )
}

export default Call