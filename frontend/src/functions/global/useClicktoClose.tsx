"use client"
import { useRef, useEffect } from 'react'


const useClicktoClose = (handler: () => void) => {

    const clickOutRef = useRef<HTMLHeadingElement | null>(null);


    useEffect(() => {
      const closeHandler = (event: MouseEvent) => {
        if (clickOutRef.current && !clickOutRef.current.contains(event.target as Node)) {
            handler();
        }
      };
    
      document.addEventListener("mousedown", closeHandler);
    
      return () => {
        document.removeEventListener("mousedown", closeHandler);
      };
    }, );
    return clickOutRef;
}

export default useClicktoClose