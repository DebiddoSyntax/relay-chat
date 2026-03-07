import Loginpage from "@/src/ui/authpages/LoginPage"
import { GoogleOAuthProvider } from '@react-oauth/google';
import CaptchaWrapper from "../ui/authpages/CaptchaWrapper";

const client_id = process.env.NEXT_PUBLIC_CLIENT_ID!

function login() {
	return (
		<div>
			<CaptchaWrapper>
				<GoogleOAuthProvider clientId={client_id}>
					<Loginpage />
				</GoogleOAuthProvider>
			</CaptchaWrapper>
		</div>
	)
}

export default login
