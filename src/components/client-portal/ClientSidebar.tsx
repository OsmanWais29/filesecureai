import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Landmark,
  Wallet,
  UserRound,
} from "lucide-react";
import { usePortalSession } from "@/data/clientPortal/session";
import { openRequestList, usePortalIntake, usePortalIncome, usePortalRequests } from "@/data/clientPortal/db";
import { INTAKE_SECTIONS } from "@/data/clientPortal/intakeSpec";

const navigationItems = [
  { title: "Home", href: "/client-portal", icon: LayoutDashboard, end: true },
  { title: "What I need to do", href: "/client-portal/tasks", icon: CheckSquare, badge: "requests" as const },
  { title: "My information", href: "/client-portal/information", icon: UserRound, badge: "intake" as const },
  { title: "Documents", href: "/client-portal/documents", icon: FileText },
  { title: "Income & expenses", href: "/client-portal/income", icon: Wallet, badge: "income" as const },
  { title: "Banking & payments", href: "/client-portal/banking", icon: Landmark },
  { title: "Appointments", href: "/client-portal/appointments", icon: Calendar },
  { title: "Messages", href: "/client-portal/messages", icon: MessageSquare },
  { title: "Settings", href: "/client-portal/settings", icon: Settings },
];

export const ClientSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { session } = usePortalSession();
  const { data: requests = [] } = usePortalRequests(session?.estateId);
  const { data: intake = [] } = usePortalIntake(session?.estateId);
  const { data: income = [] } = usePortalIncome(session?.estateId);

  const counts = {
    requests: openRequestList(requests).length,
    intake: INTAKE_SECTIONS.filter((s) => {
      const r = intake.find((x) => x.sectionKey === s.key);
      return !r || r.status === "not_started" || r.status === "draft" || r.status === "changes_requested";
    }).length,
    income: income.filter((p) => p.status === "draft" || p.status === "changes_requested").length,
  };


  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    window.dispatchEvent(new CustomEvent("clientSidebarCollapse", { detail: { collapsed: newCollapsed } }));
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card shadow-sm transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex items-center justify-between border-b p-5">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground">Client Portal</h2>
              <p className="truncate text-xs text-muted-foreground">SecureFiles AI</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="ml-auto rounded-lg">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.href || location.pathname === "/client-portal/"
              : location.pathname.startsWith(item.href);
            const count = item.badge ? counts[item.badge] : 0;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80 hover:bg-muted",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                {!collapsed && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4 text-center text-xs text-muted-foreground">
        {collapsed ? "v1" : "Secure client access · SecureFiles AI"}
      </div>
    </div>
  );
};
