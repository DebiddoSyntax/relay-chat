import { usePathname } from "next/navigation";
import { useAuth } from "./Store";
import { useEffect, useRef } from "react";
import { areInterceptorsActive, EjectInterceptors, InitializedInterceptor } from "@/src/functions/state/AxiosConfig";


export function useAuthInit() {
    const pathname = usePathname();
    const { user, accessToken, authInitialized, refreshAccessToken } = useAuth();

    const refreshRef = useRef(refreshAccessToken);

    useEffect(() => {
        refreshRef.current = refreshAccessToken;
    }, [refreshAccessToken]);

    
    useEffect(() => {
        if (accessToken) {
            InitializedInterceptor(refreshRef.current);
        }

        useAuth.setState({ authInitialized: true });

        return () => {
            EjectInterceptors();
        };
    }, []);


    useEffect(() => {
        if (authInitialized && accessToken) {
            if (!areInterceptorsActive()) {
                InitializedInterceptor(refreshRef.current);
            }
        }
    }, [pathname, accessToken, authInitialized]);
}