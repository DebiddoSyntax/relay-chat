// "use client"
// import React, { useState, useRef } from 'react'
// import { GrGallery } from "react-icons/gr";
// import { Image as IKImage, ImageKitProvider, upload as IKUpload } from "@imagekit/react";
// import api from '@/src/functions/auth/AxiosConfig';
// import Image from 'next/image';
// import { sanitizeName } from '@/src/functions/hooks/sanitizeName';


// interface ImageURLProps {
//   onSelect: (val: string) => void
//   collection: string
//   setImgErrorMessage?: (val: string)=> void
//   productName: string
//   setProductErrorMessage?: (val: string)=> void
// }

// const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
// const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT;


// function Upload({ onSelect, collection, setImgErrorMessage, productName, setProductErrorMessage }: ImageURLProps) {

//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const imageInputRef = useRef<HTMLInputElement | null>(null);
//     const [uploading, setUploading] = useState(false);
   

    

//     const handleBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const handleBoxClick = () => {
//         if(!collection && setImgErrorMessage){
//             setImgErrorMessage('Select collection before uploading')
//             return
//         }

//         if(!productName && setProductErrorMessage){
//             setProductErrorMessage('Enter product name before uploading')
//             return
//         }

//         imageInputRef.current?.click();
//     };





//     const authenticator = async() => {
//         // if(!collection && setImgErrorMessage){
//         //     setImgErrorMessage('Select collection before uploading')
//         //     return
//         // }
//         // if(!productName && setProductErrorMessage){
//         //     setProductErrorMessage('Enter product name before uploading')
//         //     return
//         // }

//         try {
//             const response = await api("/admin/products/imagekit");
//             return response.data;
//         } catch (err) {
//             if(setImgErrorMessage){
//                 setImgErrorMessage('Failed to upload')
//             }
//         }
//         // const response = await api('/admin/products/imagekit')
//         // // console.log("successful upload", response.data)
//         // return response.data
//     }


//     const handleUploadStart = () => {
//         setUploading(true);
//     };

//     const handleUploadSuccess = (res: {url: string}) => {
//         // console.log("✅ Upload Success:", res);
//         setUploading(false);
//         onSelect(res.url)
//     };

//     // const handleUploadError = (err: {message: string}) => {
//     const handleUploadError = () => {
//         setUploading(false);
//         if(setImgErrorMessage){
//             setImgErrorMessage('Failed to upload')
//         }
//         // console.log("❌ Upload Error:", err);
//     };

//     return (
//         <div className='h-52'>
//             <ImageKitProvider
//                 publicKey={publicKey}
//                 urlEndpoint={urlEndpoint}
//                 authenticator={authenticator}
//             >
//                 <div className='py-5 px-5 border-2 flex justify-center border-blue-700 border-dashed rounded-sm cursor-pointer h-full w-full' onClick={handleBoxClick}>
//                     <div className='flex flex-col gap-3 items-center my-auto h-full w-full'>
//                         {uploading ? (
//                              <div className='h-full w-full flex flex-col gap-3 justify-center'>
//                                 <div className='text-blue-700 mx-auto'>
//                                     <GrGallery />
//                                 </div>
//                                 <p className="text-blue-700 text-center text-sm font-semibold animate-pulse">
//                                     Uploading...
//                                 </p>
//                             </div> 
                            
//                             ) :imagePreview ? (
//                             <div className='h-full w-full'>
//                                 <Image
//                                     src={imagePreview}
//                                     width={400}
//                                     height={400}
//                                     alt="Preview"
//                                     className="w-full h-full object-contain rounded-md"
//                                 />
//                             </div>
//                         ) : (
//                             <div className='h-full w-full flex flex-col gap-3 justify-center'>
//                                 <div className='text-blue-700 mx-auto'>
//                                     <GrGallery />
//                                 </div>
//                                 <p className='text-sm text-blue-700 font-semibold text-center'>Click to upload</p>
//                             </div>                             
//                         )}
//                     </div>

//                     {/* Hidden ImageKit upload component */}
//                     <IKUpload
//                         ref={imageInputRef}
//                         style={{ display: "none" }}
//                         fileName={sanitizeName(productName || "untitled")}
//                         folder={sanitizeName(collection || "uncategorized")}
//                         accept="image/*"
//                         onUploadStart={handleUploadStart}
//                         onSuccess={handleUploadSuccess}
//                         onError={handleUploadError}
//                         onChange={handleBoxChange}
//                         useUniqueFileName={true}
//                     />
//                 </div>
//             </ImageKitProvider>

//         </div>
 
//   )
// }

// export default Upload