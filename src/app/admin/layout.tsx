import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PawPrint, LogOut, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <PawPrint className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="font-bold text-xl text-gray-800">PetNFC Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-700">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          {/* We can add more links here later */}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
               // In a real app with client component we'd use signOut(), for server we link to api/auth/signout
          >
            <Link href="/api/auth/signout" className="flex items-center w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
           <div className="flex items-center">
            <PawPrint className="w-6 h-6 text-indigo-600 mr-2" />
            <span className="font-bold text-lg text-gray-800">PetNFC</span>
           </div>
           <Link href="/api/auth/signout" className="text-gray-500 hover:text-red-600">
             <LogOut className="w-5 h-5" />
           </Link>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
