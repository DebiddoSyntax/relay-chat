import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "../ui/reusable/Wrapper";
import AuthInit from "../functions/auth/useAuthInit";
import AppWrapper from "../functions/chats/SocketWrapper";

export const metadata: Metadata = {
  title: "RelayChat",
  description: "chat app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	// useGlobalSocket()

	return (
		<html lang="en">
			<body>
				<Wrapper>
					<AuthInit />
					{children}
				</Wrapper>
			</body>
		</html>
	);
}
