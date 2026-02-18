import api, { EjectInterceptors } from "./AxiosConfig";
import { useAuth } from "./Store";

export const logoutAction = async (set: any, get: any) => {
    const token = get().accessToken;

    try {
        set({ isLoading: true });
        if (token) {
            await api.post("/auth/logout/");
            console.log('logged out req successful')
        }
    } catch (err) {
        console.error(err)
    } finally {
        set({ isLoading: false });
    }
    
    EjectInterceptors();

    set({
        user: null,
        accessToken: null,
        authInitialized: false,
        isLoading: false,
    });

    useAuth.persist.clearStorage();
    
    console.log("logged out");
}