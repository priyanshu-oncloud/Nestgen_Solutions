import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ref, onValue, set } from "firebase/database";
import { database } from "@/firebase";

interface WebsiteSettings {
  websiteName: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

const ManageWebsite = () => {
  const [settings, setSettings] = useState<WebsiteSettings>({
    websiteName: "",
    email: "",
    phone: "",
    address: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
  });

  const { toast } = useToast();

  // Load settings from Firebase
  useEffect(() => {
    const settingsRef = ref(database, "settings");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (key: keyof WebsiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await set(ref(database, "settings"), settings);
      toast({ title: "Website settings updated successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Website Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Edit Website Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium">Website Name</label>
                <Input
                  value={settings.websiteName}
                  onChange={(e) => handleChange("websiteName", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Facebook URL</label>
                <Input
                  value={settings.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Twitter URL</label>
                <Input
                  value={settings.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/yourpage"
                />
              </div>

              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={settings.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/yourpage"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input
                  value={settings.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              <Button type="submit" className="mt-4">
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ManageWebsite;
