import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/contexts/AuthContext";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut, user } = useAuth();

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar className="border-b border-default-200/50 w-[1200px] mx-auto justify-end">
        <NavbarBrand>
          <Link className="font-bold text-inherit" color="foreground" href="/">
            {/* {siteConfig.name} */}
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.email?.charAt(0).toUpperCase()}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Logado como</p>
                  <p className="text-default-500">{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onPress={() => signOut()}
                >
                  Sair
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
    </div>
  );
}
