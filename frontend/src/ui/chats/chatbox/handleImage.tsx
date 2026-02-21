import React, { useEffect, useState } from 'react'

export function handleImage(ImageSrc: string | undefined) {

    const [canShowImage, setCanShowImage] = useState(false);


    // set image effect
    useEffect(() => {
        if (!ImageSrc) {
            setCanShowImage(false);
            return;
        }

        const img = new window.Image();
        img.src = ImageSrc;

        img.onload = () => setCanShowImage(true);
        img.onerror = () => setCanShowImage(false);

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [ImageSrc]);
    
    return { canShowImage }
}
