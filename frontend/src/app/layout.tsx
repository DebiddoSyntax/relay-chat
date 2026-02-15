import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "../functions/global/Wrapper";
import AuthInit from "../functions/global/useAuthInit";
import Call from "../ui/chats/call/Call";
import CallAlert from "../ui/chats/CallAlert";


export const metadata: Metadata = {
  title: "RelayChat",
  description: "chat app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

	return (
		<html lang="en">
			<body>
				<Wrapper>
					{/* <IncomingCall /> */}
					<CallAlert />
					<AuthInit />
					{children}
				</Wrapper>
			</body>
		</html>
	);
}
