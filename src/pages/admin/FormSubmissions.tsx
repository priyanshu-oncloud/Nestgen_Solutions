import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "@/firebase";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ================= TYPES ================= */

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  submittedAt: string;
}

interface CareerSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  experience?: string;
  resumeName?: string;
  resumeUrl?: string;
  message: string;
  submittedAt: string;
}

/* ================= COMPONENT ================= */

const FormSubmissions = () => {
  const { toast } = useToast();

  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [careerSubmissions, setCareerSubmissions] = useState<CareerSubmission[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* -------- LOAD DATA -------- */
  useEffect(() => {
    const contactRef = ref(database, "contact_messages");
    const careerRef = ref(database, "careers_applications");

    const unsubContact = onValue(contactRef, (snap) => {
      const data = snap.val();
      if (!data) return setContactSubmissions([]);

      const list = Object.entries(data).map(([id, v]: any) => ({
        id,
        name: v.name || "",
        email: v.email || "",
        phone: v.phone || "",
        company: v.company || "",
        subject: v.subject || "",
        message: v.message || "",
        submittedAt: v.submittedAt || new Date().toISOString(),
      }));

      setContactSubmissions(list.reverse());
    });

    const unsubCareer = onValue(careerRef, (snap) => {
      const data = snap.val();
      if (!data) return setCareerSubmissions([]);

      const list = Object.entries(data).map(([id, v]: any) => ({
        id,
        name: v.name || "",
        email: v.email || "",
        phone: v.phone || "",
        position: v.position || "",
        experience: v.experience || "",
        resumeName: v.resumeName || v.resume || "",
        resumeUrl: v.resumeUrl || "",
        message: v.message || "",
        submittedAt: v.submittedAt || new Date().toISOString(),
      }));

      setCareerSubmissions(list.reverse());
    });

    return () => {
      unsubContact();
      unsubCareer();
    };
  }, []);

  /* -------- DELETE -------- */
  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact message?")) return;
    await remove(ref(database, `contact_messages/${id}`));
    toast({ title: "Contact deleted" });
  };

  const deleteCareer = async (id: string) => {
    if (!confirm("Delete this career application?")) return;
    await remove(ref(database, `careers_applications/${id}`));
    toast({ title: "Career application deleted" });
  };

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Form Submissions</h1>

        <Tabs defaultValue="contact">
          <TabsList>
            <TabsTrigger value="contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact ({contactSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="careers">
              <Briefcase className="w-4 h-4 mr-2" />
              Careers ({careerSubmissions.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= CONTACT ================= */}
          <TabsContent value="contact" className="space-y-4">
            {contactSubmissions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex justify-between flex-row">
                  <div>
                    <CardTitle>{s.name}</CardTitle>
                    <p className="flex gap-2 text-sm"><Mail className="w-4 h-4" />{s.email}</p>
                    {s.phone && (
                      <p className="flex gap-2 text-sm"><Phone className="w-4 h-4" />{s.phone}</p>
                    )}
                    {s.subject && <Badge className="mt-2">{s.subject}</Badge>}
                  </div>

                  <Button size="sm" variant="destructive" onClick={() => deleteContact(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <CardContent>
                  <p>{s.message}</p>
                  <p className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(s.submittedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ================= CAREERS ================= */}
          <TabsContent value="careers" className="space-y-4">
            {careerSubmissions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex justify-between flex-row">
                  <div>
                    <CardTitle>{s.name}</CardTitle>

                    <p className="flex gap-2 text-sm"><Mail className="w-4 h-4" />{s.email}</p>
                    {s.phone && (
                      <p className="flex gap-2 text-sm"><Phone className="w-4 h-4" />{s.phone}</p>
                    )}

                    <Badge className="mt-2">{s.position}</Badge>
                    {s.experience && (
                      <p className="text-sm text-muted-foreground">
                        Experience: {s.experience}
                      </p>
                    )}

                    {s.resumeName && (
                      <p className="text-sm text-muted-foreground">
                        Resume: {s.resumeName}
                      </p>
                    )}

                    {/* ✅ RESUME ACTIONS */}
                    {s.resumeUrl && (
                      <div className="flex gap-3 items-center mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewUrl(s.resumeUrl!)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>

                        <a href={s.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>

                  <Button size="sm" variant="destructive" onClick={() => deleteCareer(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <CardContent>
                  <p>{s.message}</p>
                  <p className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(s.submittedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= RESUME PREVIEW MODAL ================= */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[85%] h-[85%] rounded-lg relative">
            <Button
              size="sm"
              className="absolute top-3 right-3 z-10"
              onClick={() => setPreviewUrl(null)}
            >
              Close
            </Button>
            <iframe src={previewUrl} className="w-full h-full rounded-lg" />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default FormSubmissions;
