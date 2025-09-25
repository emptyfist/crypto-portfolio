"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  href: string;
  children: React.ReactNode;
}

const MenuItem = memo(function MenuItem({ href, children }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
});

export default MenuItem;
