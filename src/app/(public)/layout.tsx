export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-foreground flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-xl font-bold">Crypto Portfolio</h1>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-foreground/60">
        © {new Date().getFullYear()} Crypto Portfolio · All rights reserved
      </footer>
    </div>
  );
}
