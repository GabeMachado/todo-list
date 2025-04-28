export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Todo List App",
  description: "Organize suas tarefas de forma eficiente.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: "Configurações",
      href: "/settings",
    },
  ],
  links: {
    github: "https://github.com/frontio-ai/heroui",
  },
};
