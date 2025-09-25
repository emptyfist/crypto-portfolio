import { LayoutDashboard, History, Briefcase, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MenuItem from "@/components/layout/menuitem";
import Profile from "@/components/layout/profile";

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaderboard", href: "/leaderboard", icon: Briefcase },
  { name: "History", href: "/history", icon: History },
] as const satisfies { name: string; href: string; icon: LucideIcon }[];

export default function SideMenu() {
  return (
    <>
      <div className="p-6 border-b border-white/20">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="CryptoPortfolio"
            width={210}
            height={32}
            className="brightness-0 invert"
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <MenuItem key={item.href} href={item.href}>
              <IconComponent className="w-4 h-4" />
              <span>{item.name}</span>
            </MenuItem>
          );
        })}
      </nav>

      {/* Avatar Section */}
      <div className="p-4 border-t border-white/20">
        <Profile />
      </div>
    </>
  );
}
