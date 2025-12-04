import type { Metadata } from "next";
import "./globals.css";
// import Navbar from "../ui/reusable/Navbar";

export const metadata: Metadata = {
  title: "RelayChat",
  description: "chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* <Navbar /> */}
        {children}
      </body>
    </html>
  );
}
