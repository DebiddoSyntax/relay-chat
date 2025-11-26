import api from "./AxiosConfig";


export const refreshTokenAction = async (set: any, get: any) => {
    try {
        const token = get().accessToken;
        if (!token) {
            await get().logout();
            return;
        }

        set({ isLoading: true });
        const res = await api.post("/auth/refresh");
        const newToken = res.data.accessToken;

        set({ accessToken: newToken });
        return newToken;
    } catch (e) {
        await get().logout();
        return;
    } finally {
        set({ isLoading: false });
    }
}