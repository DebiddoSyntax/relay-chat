import Sidebar from "@/src/ui/reusable/Sidebar";


export default function UserLayout({ children }: Readonly<{  children: React.ReactNode; }>) {
    return (
        <div className="flex gap-0 px-5 md:px-6 lg:px-10 w-full h-screen">
          <Sidebar />
          {children}
        </div>
     
  );
}
