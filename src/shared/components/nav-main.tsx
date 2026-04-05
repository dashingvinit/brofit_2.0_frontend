import { Link } from "react-router-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar";

type NavSubItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
  isActive?: boolean;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: NavSubItem[];
};

export function NavMain({ groups }: { groups: NavGroup[] }) {
  return (
    <SidebarMenu>
      {groups.map((group) => {
        const Icon = group.icon;
        const hasActiveChild = group.items.some((i) => i.isActive);

        return (
          <Collapsible
            key={group.label}
            defaultOpen={group.defaultOpen ?? hasActiveChild}
            className="group/navgroup"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={hasActiveChild} tooltip={group.label}>
                  <Icon />
                  <span>{group.label}</span>
                  <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/navgroup:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {group.items.map((item) => {
                    const SubIcon = item.icon;
                    return (
                      <SidebarMenuSubItem key={item.name}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <Link to={item.href}>
                            {SubIcon && <SubIcon className="size-3" />}
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}
