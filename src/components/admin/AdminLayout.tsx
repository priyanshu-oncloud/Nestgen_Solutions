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
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Add Certificate", path: "/admin/ManageCertificates", icon: Briefcase },
    { name: "Add Offer Letter", path: "/admin/ManageOffers", icon: Briefcase },
    { name: "Services", path: "/admin/services", icon: Briefcase },
    { name: "Projects", path: "/admin/projects", icon: FolderKanban },
    { name: "Team", path: "/admin/team", icon: Users },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star },
    { name: "Form Submissions", path: "/admin/submissions", icon: MessageSquare },
    { name: "Website Settings", path: "/admin/website", icon: Settings },
  ];

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

            {/* Logout */}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
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
