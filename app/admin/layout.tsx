import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ADMIN_ROLES } from "@/lib/const";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!ADMIN_ROLES.includes(session.user.userType)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-foreground">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">ISCE Admin</h1>
            <nav className="flex gap-4 ml-8">
              <a
                href="/admin/orders"
                className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Orders
              </a>
            </nav>
          </div>
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
