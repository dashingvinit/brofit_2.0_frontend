import { Link } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

type FlatItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export function NavFlat({ items }: { items: FlatItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.name}>
                <Link to={item.href}>
                  <Icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
