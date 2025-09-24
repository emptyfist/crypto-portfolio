import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-xl font-bold text-foreground">Crypto Portfolio</h1>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground">
          Track Your Crypto.
          <br />
          Anytime, Anywhere.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Upload your transactions, see real-time holdings, and manage your
          portfolio securely.
        </p>
        <Link
          href="/signup"
          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors shadow-lg text-primary-foreground"
        >
          Get Started →
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Crypto Portfolio · All rights reserved
      </footer>
    </div>
  );
}
