import axios from "axios";
import api from "./AxiosConfig";

const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL


export const refreshTokenAction = async (set: any, get: any) => {
    const token = get().accessToken;
    const refreshToken = get().refreshToken;
    if (!token) {
        await get().logout();
        return;
    }

    try {

        set({ isLoading: true });
        const res = await api.post(`/auth/refresh/`, { refreshToken: refreshToken });
        
        const newToken = res.data.accessToken;

        set({ accessToken: newToken });
        console.log('refreshed token', res.data)
        return newToken;
    } catch (e) {
        console.log('failed to refresh token', e)
        await get().logout();
        return;
    } finally {
        set({ isLoading: false });
    }
}