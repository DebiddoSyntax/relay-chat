// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	try{
		// console.log('middle ware hit')
		const { pathname } = req.nextUrl;
		// const refreshToken = req.cookies.get("refreshToken")?.value;

		
		// const protectedUserPaths = ['/chats', '/groups', '/sydneyai', '/profile'];
		// const isProtectedUserRoute = protectedUserPaths.some((path) =>
		// 	pathname.startsWith(path)
		// );

		// // Redirect unauthenticated users trying to access protected pages or admin panel
		// // if (!refreshToken && (isProtectedUserRoute)) {
		// if (isProtectedUserRoute) {
		// 	const loginUrl = new URL("/login", req.url);
		// 	return NextResponse.redirect(loginUrl);
		// }

		
		// Continue for everything else
		return NextResponse.next();
	}catch(error) {
		console.error("⚠️ Middleware error:", error);
	}
}


// MIDDLEWARE CONFIG
export const config = {
	matcher: [
        '/chats/:path*', 
        '/groups/:path*', 
        '/sydneyai/:path*', 
        '/profile/:path*',
	],
};