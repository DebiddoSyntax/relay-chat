import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "../functions/global/Wrapper";
import AuthInit from "../functions/auth/useAuthInit";
import CallAlert from "../ui/chats/call/CallAlert";
import ScrollToTop from "../functions/global/usescrollToTop";


export const metadata: Metadata = {
  title: "RelayChat",
  description: "chat app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

	return (
		<html lang="en">
			<body>
				<Wrapper>
					<ScrollToTop />
					<CallAlert />
					<AuthInit />
					{children}
				</Wrapper>
			</body>
		</html>
	);
}
