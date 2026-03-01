import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar";

type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: { name: string; href: string; isActive?: boolean }[];
};

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.label, g.items.some((i) => i.isActive)]))
  );

  const toggle = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <>
      {groups.map((group) => {
        const Icon = group.icon;
        const isOpen = openGroups[group.label];
        const hasActiveChild = group.items.some((i) => i.isActive);

        return (
          <SidebarGroup key={group.label}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={group.label}
                  isActive={hasActiveChild}
                  onClick={() => toggle(group.label)}
                >
                  <Icon />
                  <span>{group.label}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto size-4 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>

                {isOpen && (
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.name}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <Link to={item.href}>
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
