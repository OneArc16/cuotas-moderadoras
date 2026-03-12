import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const displayName =
    session.user.name || session.user.username || session.user.email;

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="min-h-screen bg-muted/30">
          <header className="border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cuotas Moderadoras
                  </p>
                  <h1 className="text-base font-semibold">Dashboard</h1>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {displayName}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}