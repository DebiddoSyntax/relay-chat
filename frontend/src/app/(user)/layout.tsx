import Sidebar from "@/src/ui/reusable/Sidebar";
import ProtectedRoute from "@/src/functions/routing/ProtectedRoute";


export default function UserLayout({ children }: Readonly<{  children: React.ReactNode; }>) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col md:flex-row gap-0 pl-0 md:pl-6 lg:pl-10 w-full h-screen">
          <Sidebar />
          <div className="flex-1 w-full h-full overflow-hidden">
            {children}
          </div>
        </div>
      </ProtectedRoute>
     
  );
}
