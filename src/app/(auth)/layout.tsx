import SideMenu from "@/components/layout/sidemenu";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen max-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <div className="w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 flex flex-col">
        <SideMenu />
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
