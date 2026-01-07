"use client";
import { create } from "zustand";
import { UserType } from "@/src/functions/types/UserType";
import { persist } from "zustand/middleware";
import { refreshTokenAction } from "./refreshToken";
import { logoutAction } from "./logout";
import { InitializedInterceptor } from "./AxiosConfig";

interface AuthStore {
    user: UserType | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    authInitialized: boolean;

    setAuth: (user: UserType, token: string, rtoken: string) => void;
    logout: () => Promise<void>;
    setIsLoading: (loading: boolean) => void;
    setAuthInitialized: (initialized: boolean) => void;
    refreshAccessToken: () => Promise<string | undefined>;
}



export const useAuth = create<AuthStore>()(
    persist(
        (set, get) => ({
            //default values
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            authInitialized: false,


            //setloading state
            setIsLoading: (loading) => set({ isLoading: loading }),

            //set state
            setAuthInitialized: (initialized) => set({ authInitialized: initialized }),

            
            //set user auth data
            setAuth: (user, token, rtoken) => {
                set({ user, accessToken: token, refreshToken: rtoken, authInitialized: true });
                // const refreshFn = get().refreshAccessToken;
                // InitializedInterceptor(refreshFn);
            },

            
            // logout 
            logout: async() => logoutAction(set, get),


            //refresh token
            refreshAccessToken: async() => refreshTokenAction(set, get),
        }),

        // handle local storage 
        {   
            name: "auth", 
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                authInitialized: state.authInitialized,
            }), 
        } 
    )
);


