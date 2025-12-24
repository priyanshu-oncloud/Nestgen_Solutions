import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, FolderKanban, Users, Star } from "lucide-react";

import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    team: 0,
    testimonials: 0,
  });

  useEffect(() => {
    const servicesRef = ref(database, "services");
    const projectsRef = ref(database, "projects");
    const teamRef = ref(database, "team");
    const testimonialsRef = ref(database, "testimonials");

    const unsubServices = onValue(servicesRef, (snap) => {
      setStats((prev) => ({
        ...prev,
        services: snap.exists() ? Object.keys(snap.val()).length : 0,
      }));
    });

    const unsubProjects = onValue(projectsRef, (snap) => {
      setStats((prev) => ({
        ...prev,
        projects: snap.exists() ? Object.keys(snap.val()).length : 0,
      }));
    });

    const unsubTeam = onValue(teamRef, (snap) => {
      setStats((prev) => ({
        ...prev,
        team: snap.exists() ? Object.keys(snap.val()).length : 0,
      }));
    });

    const unsubTestimonials = onValue(testimonialsRef, (snap) => {
      setStats((prev) => ({
        ...prev,
        testimonials: snap.exists() ? Object.keys(snap.val()).length : 0,
      }));
    });

    return () => {
      unsubServices();
      unsubProjects();
      unsubTeam();
      unsubTestimonials();
    };
  }, []);

  const statCards = [
    { title: "Services", value: stats.services, icon: Briefcase, color: "text-blue-500" },
    { title: "Projects", value: stats.projects, icon: FolderKanban, color: "text-green-500" },
    { title: "Team Members", value: stats.team, icon: Users, color: "text-purple-500" },
    { title: "Testimonials", value: stats.testimonials, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your admin panel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total {stat.title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Use the sidebar to manage your website content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Manage Services from Services section</p>
            <p>• Add / edit Projects in Projects section</p>
            <p>• Maintain Team Members information</p>
            <p>• Control Testimonials shown on website</p>
            <p className="mt-4 text-xs text-green-600">
              ✅ Data synced live from Firebase Realtime Database
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
