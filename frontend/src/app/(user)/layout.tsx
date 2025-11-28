import Sidebar from "@/src/ui/reusable/Sidebar";


export default function UserLayout({ children }: Readonly<{  children: React.ReactNode; }>) {
    return (
        <div className="flex gap-0 pl-5 md:pl-6 lg:pl-10 w-full h-screen">
          <Sidebar />
          <div className="flex-1 w-full h-full overflow-hidden">
            {children}
          </div>
        </div>
     
  );
}
