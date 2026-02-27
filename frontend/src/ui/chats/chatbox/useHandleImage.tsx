import React, { useEffect, useState } from 'react'

export function useHandleImage(imageSrc: string | undefined) {

    const [canShowImage, setCanShowImage] = useState(false);


    // set image effect
    useEffect(() => {
        if (!imageSrc) {
            setCanShowImage(false);
            return;
        }

        const img = new window.Image();
        img.src = imageSrc;

        img.onload = () => setCanShowImage(true);
        img.onerror = () => setCanShowImage(false);

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [imageSrc]);
    
    return { canShowImage }
}
