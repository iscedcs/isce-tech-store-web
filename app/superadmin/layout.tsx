import { auth } from "@/auth";
import { SUPER_ADMIN_NAV_LINKS, SUPER_ADMIN_ROLES } from "@/lib/const";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!SUPER_ADMIN_ROLES.includes(session.user.userType)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-foreground">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                ISCE Control
              </p>
              <h1 className="text-xl font-bold text-gray-900">Superadmin</h1>
            </div>
            <nav className="ml-8 flex gap-4">
              {SUPER_ADMIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <span className="text-sm text-gray-500">{session.user.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
