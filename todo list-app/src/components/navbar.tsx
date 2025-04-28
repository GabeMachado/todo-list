import { Link } from "@heroui/link";
import { NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <NavbarBrand>
          <Link className="font-bold text-inherit" color="foreground" href="/">
            {siteConfig.name}
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </div>
    </nav>
  );
}
