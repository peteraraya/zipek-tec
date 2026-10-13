import AdminHeader from "@/components/admin/AdminHeader";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireStaff();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader name={profile.display_name} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
