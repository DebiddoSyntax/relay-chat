"use client"
import api from "@/src/functions/auth/AxiosConfig";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from "@imagekit/react";
import { useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import { MdOutlineClear } from "react-icons/md";


interface ImageURLProps {
  onSelect: (val: string) => void
  setDisplayImage: (val: string | undefined)=> void
  userImage: string | undefined
//   collection: string
//   setImgErrorMessage?: (val: string)=> void
//   productName: string
//   setProductErrorMessage?: (val: string)=> void
}


function Upload({ onSelect, setDisplayImage, userImage }: ImageURLProps) {
    const [progress, setProgress] = useState(0);
    const abortController = new AbortController();


    const authenticator = async () => {
        try {
            const response = await api.get("/image/auth/");
            const { signature, expire, token, publicKey } = response.data;
            return { signature, expire, token, publicKey };
        } catch (error) {
            // Log the original error for debugging before rethrowing a new error.
            console.error("Authentication error:", error);
            throw new Error("Authentication request failed");
        }
    };

    
    const handleUpload = async (file: File) => {

        setProgress(0);

        let authParams;
        try {
            authParams = await authenticator();
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            return;
        }
        const { signature, expire, token, publicKey } = authParams;

        try {
            const uploadResponse = await upload({
                expire,
                token,
                signature,
                publicKey,
                file,
                fileName: file.name, 
                folder: 'relayChat',

                onProgress: (event) => {
                    setProgress(Math.ceil((event.loaded / event.total) * 100));
                },
                
                abortSignal: abortController.signal,
            });

            console.log("Upload response:", uploadResponse);
            if(uploadResponse.url){
                onSelect(uploadResponse.url)
                setDisplayImage(uploadResponse.url)
            }

        } catch (error) {
            if (error instanceof ImageKitAbortError) {
                console.error("Upload aborted:", error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                console.error("Invalid request:", error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                console.error("Network error:", error.message);
            } else if (error instanceof ImageKitServerError) {
                console.error("Server error:", error.message);
            } else {
                console.error("Upload error:", error);
            }
        }
    };

    const [fileName, setFileName] = useState("Upload file");


    const handleImageClear = () => {
        if(userImage){
            setDisplayImage(userImage)
        }else{
            setDisplayImage(undefined)
        }
    }

    return (
        <div className="flex gap-3 items-center">
            <div className="border-2 border-gray-200 py-2 px-3 rounded-4xl cursor-pointer w-36 flex justify-center">

                <label className="flex items-center gap-3 cursor-pointer">
                    <BiUpload />
                    <input
                        type="file"
                        // ref={fileInputRef} 
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setFileName(file.name);
                            handleUpload(file);
                            
                            setFileName(e.target.files?.[0]?.name || "Upload file")
                        }}
                    />
                    <span className="text-sm font-medium truncate w-20">
                        {fileName}
                    </span>
                </label>
            </div>
            {/* {progress > 0 && <progress value={progress} max={100}></progress>} */}
            {progress > 0 && (
                <span className="text-xs font-medium text-gray-600">
                    {progress == 100 ? <MdOutlineClear className="text-2xl cursor-pointer" onClick={handleImageClear} /> : `${progress}%`}
                </span>
            )}

        </div>
    );
};

export default Upload;