import ProtectedRoute from "@/src/functions/routing/ProtectedRoute";
import SideBarWrap from "@/src/ui/reusable/SideBarWrap";


export default function UserLayout({ children }: Readonly<{  children: React.ReactNode; }>) {
    return (
      	<ProtectedRoute>
          	<SideBarWrap />
			{/* <Sidebar /> */}
         	 <div className="flex-1 w-full h-full">
            	{children}
        	</div>
      	</ProtectedRoute>
     
  );
}
