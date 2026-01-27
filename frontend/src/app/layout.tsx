import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "../functions/global/Wrapper";
import AuthInit from "../functions/global/useAuthInit";

export const metadata: Metadata = {
  title: "RelayChat",
  description: "chat app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

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
