// import axios from "axios";
// import { signupType } from "@/src/ui/authpages/SignupPage";

// const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

// export const loginAction = async (payload: signupType) => {
//     try {
//         const res = await axios.post(`${apiURL}/auth/signup/`, payload)
//         const newToken = res.data.accessToken;

//         return newToken;
//     } catch (e) {
//         await get().logout();
//         return;
//     } finally {
//         set({ isLoading: false });
//     }
// }