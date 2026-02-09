"use client"
import api from '@/src/functions/auth/AxiosConfig';
import axios from 'axios';
import { useRef, useState } from 'react'
import LoadingModal from '../../reusable/LoadingModal';
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { IoClose } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";



function PhoneCall() {

    const [callModal, setCallModal] = useState(false)
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    // const peerRef = useRef<any | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [inCall, setInCall] = useState(false);

    const joinCall = async () => {
        if (inCall) return;

        // 1. Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        streamRef.current = stream;

        if(localVideoRef.current){
            localVideoRef.current.srcObject = stream;
        }

        // 2. Create peer connection
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerRef.current = peer;

        // 3. Add tracks
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        // 4. Remote stream
        peer.ontrack = event => {
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // 5. WebSocket signaling
        const socket = new WebSocket("ws://localhost:8000/ws/video/room1/");

        socketRef.current = socket;

        socket.onmessage = async event => {
            const data = JSON.parse(event.data);

            if (data.offer) {
                await peer.setRemoteDescription(data.offer);
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.send(JSON.stringify({ answer }));
            }

            if (data.answer) {
                await peer.setRemoteDescription(data.answer);
            }

            if (data.candidate) {
                await peer.addIceCandidate(data.candidate);
            }
        };

        // 6. Send ICE candidates
        peer.onicecandidate = event => {
            if (event.candidate) {
                socket.send(
                    JSON.stringify({ candidate: event.candidate })
                );
            }
        };

        // 7. Create offer
        socket.onopen = async () => {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.send(JSON.stringify({ offer }));
        };

        setInCall(true);
    };



    const leaveCall = () => {
        setInCall(false);

        socketRef.current?.close();
        peerRef.current?.close();

        streamRef.current?.getTracks().forEach(track => track.stop());

        if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = null
            }
        
            if(localVideoRef.current){
            localVideoRef.current.srcObject = null
        }

        socketRef.current = null;
        peerRef.current = null;
        streamRef.current = null;
    };


    const handleJoinCall = () => {
        joinCall()
        setCallModal(true)
    }

    const handleLeavCall = () => {
        setCallModal(false)
        leaveCall()
    }

    return (
        <div>
            <FaPhone className='text-base cursor-pointer' />
            {/* <FaPhone className='text-base cursor-pointer' onClick={handleJoinCall} /> */}


            {callModal && (
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className={`flex flex-col relative w-96 md:w-[840px] min-h-96 m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
                        <div className='grid grid-cols-1 gap-6 w-full min-h-[740px]'>
                            <div className='w-full h-[370px]'>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className='w-full h-full bg-black'
                                    // style={{ width: "300px", background: "#000" }}
                                />
                            </div>

                            <div className='w-full h-[370px]'>
                                 <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    className='w-full h-full bg-black'
                                    // style={{ width: "300px", background: "#000" }}
                                />
                            </div>
                        </div>

                        <button type='button' className='mt-10 cursor-pointer bg-red-700 text-white py-5 px-5' onClick={handleLeavCall}>Leave Call</button>
                        
                    </div>
                </div>
            )}
                
        </div>
    )
}

export default PhoneCall
