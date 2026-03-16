import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileSidebar from "@/components/profile/profile-sidebar";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-primary-light py-8">
        {/* Sidebar */}

        {/* Main Content */}
        <div className="lg:col-span-3 rounded-lg shadow-sm p-6 border border-gray-200">
          {children}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
