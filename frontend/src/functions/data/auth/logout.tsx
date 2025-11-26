import { useRouter } from "next/router";
import api, { EjectInterceptors } from "./AxiosConfig";


export const logoutAction = async (set: any, get: any) => {
    const token = get().accessToken;

    try {
        set({ isLoading: true });
        if (token) {
            await api.post("/auth/logout", { accesstoken: token });
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
    });

    localStorage.removeItem("auth");

    const router = useRouter();
    router.push("/login");
}