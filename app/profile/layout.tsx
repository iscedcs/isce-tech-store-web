import { auth } from "@/auth";
import { getRoleLoginRedirect } from "@/routes";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userType = session.user?.userType || "USER";
  if (userType !== "USER") {
    redirect(getRoleLoginRedirect(userType));
  }

  return (
    <div className="min-h-screen bg-foreground">
      <main className="px-4 sm:px-6 max-w-7xl mx-auto lg:px-8 py-20">
        {children}
      </main>
    </div>
  );
}
