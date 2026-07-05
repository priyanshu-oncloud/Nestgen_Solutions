import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Home,
  Briefcase,
  FolderKanban,
  Users,
  Star,
  MessageSquare,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import logo from "@/assets/logo.webp";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user, role } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const allNavItems = [
    { name: "Dashboard", path: "/admin", icon: Home, roles: ["superadmin", "admin", "editor"] },
    { name: "Add Certificate", path: "/admin/ManageCertificates", icon: Briefcase, roles: ["superadmin"] },
    { name: "Offer Letter", path: "/admin/ManageOffers", icon: Briefcase, roles: ["superadmin"] },
    { name: "Coupons", path: "/admin/ManageCoupons", icon: Star, roles: ["superadmin"] },
    { name: "Services", path: "/admin/services", icon: Briefcase, roles: ["superadmin"] },
    { name: "Projects", path: "/admin/projects", icon: FolderKanban, roles: ["superadmin"] },
    { name: "Team", path: "/admin/team", icon: Users, roles: ["superadmin"] },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star, roles: ["superadmin"] },
    { name: "Form Submissions", path: "/admin/submissions", icon: MessageSquare, roles: ["superadmin"] },
    { name: "Website Settings", path: "/admin/website", icon: Settings, roles: ["superadmin"] },
  ];

  const navItems = allNavItems.filter((item) => role && item.roles.includes(role));

  const SidebarContent = () => (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ================= HEADER ================= */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">

            {/* Left: Menu + Logo */}
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-accent"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <img
                src={logo}
                alt="Logo"
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="text-lg md:text-xl font-bold">
                Admin Panel
              </span>
            </div>

            {/* User info + Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-xs font-medium truncate max-w-[160px]">{user.email}</span>
                  {role && (
                    <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">
                      {role}
                    </span>
                  )}
                </div>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden md:block w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <SidebarContent />
        </aside>

        {/* ================= MOBILE SIDEBAR ================= */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
