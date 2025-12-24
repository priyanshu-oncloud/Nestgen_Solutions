import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Briefcase, FolderKanban, Users, Star, MessageSquare, Settings } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import logo from "@/assets/logo.jpeg";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Services", path: "/admin/services", icon: Briefcase },
    { name: "Projects", path: "/admin/projects", icon: FolderKanban },
    { name: "Team", path: "/admin/team", icon: Users },
    { name: "Testimonials", path: "/admin/testimonials", icon: Star },
    { name: "Form Submissions", path: "/admin/submissions", icon: MessageSquare },
    { name: "Website Settings", path: "/admin/website", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-xl font-bold text-foreground">Admin Panel</span>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
