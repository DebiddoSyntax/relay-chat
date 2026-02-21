import Loginpage from "@/src/ui/authpages/LoginPage"
import { GoogleOAuthProvider } from '@react-oauth/google';

const client_id = process.env.NEXT_PUBLIC_CLIENT_ID!

function login() {
	return (
		<div>
			<GoogleOAuthProvider clientId={client_id}>
				<Loginpage />
			</GoogleOAuthProvider>
		</div>
	)
}

export default login
