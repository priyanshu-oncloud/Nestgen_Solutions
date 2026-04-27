import { useState, useEffect } from "react";
import { ref, push, get, child } from "firebase/database";
import { database } from "@/firebase";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    address: "",
    hours: "Mon–Fri: 9 AM – 6 PM", // default if not stored
    websiteName: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  // Fetch settings from Firebase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snapshot = await get(child(ref(database), "settings"));
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        } else {
          console.warn("No settings found in Firebase");
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submission = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };

      await push(ref(database, "contact_messages"), submission);

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to Send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* HERO */}
      <section className="py-24 bg-gradient-hero text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground">
          Have a project in mind? Let's discuss how we can help bring your vision to life.
        </p>
      </section>

      {/* CONTACT */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* INFO */}
            <div className="space-y-6">
              <Card className="p-6">
                <Mail className="mb-4" />
                <h3 className="font-semibold">Email</h3>
                <a href={`mailto:${settings.email}`} className="text-primary">
                  {settings.email || "Loading..."}
                </a>
              </Card>

              <Card className="p-6">
                <Phone className="mb-4" />
                <h3 className="font-semibold">Phone</h3>
                <p>+91 {settings.phone || "Loading..."}</p>
              </Card>

              <Card className="p-6">
                <MapPin className="mb-4" />
                <h3 className="font-semibold">Address</h3>
                <p>{settings.address || "Loading..."}</p>
              </Card>

              <Card className="p-6">
                <Clock className="mb-4" />
                <h3 className="font-semibold">Hours</h3>
                <p>{settings.hours || "Mon–Fri: 9 AM – 6 PM"}</p>
              </Card>
            </div>

            {/* FORM */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="text-3xl font-bold mb-6">Send a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                      placeholder="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <Input
                    required
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />

                  <Textarea
                    required
                    rows={6}
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
