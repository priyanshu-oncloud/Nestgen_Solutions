import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
} from "firebase/storage";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
        resumeName: v.resumeName || "",
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

  /* -------- DELETE CONTACT -------- */
  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact message?")) return;
    await remove(ref(database, `contact_messages/${id}`));
    toast({ title: "Contact deleted" });
  };

  /* -------- DELETE CAREER -------- */
  const deleteCareer = async (id: string) => {
    if (!confirm("Delete this career application and resume?")) return;

    try {
      const record = careerSubmissions.find((c) => c.id === id);

      if (record?.resumeUrl) {
        const storage = getStorage();
        const fileRef = storageRef(storage, record.resumeUrl);
        await deleteObject(fileRef);
      }

      await remove(ref(database, `careers_applications/${id}`));
      toast({ title: "Career deleted" });
    } catch (err) {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  };

  /* -------- EXPORT CAREERS EXCEL -------- */
  const exportCareersExcel = async () => {
    if (!careerSubmissions.length) {
      toast({ title: "No career data" });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Career Applications");

    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Position", key: "position", width: 20 },
      { header: "Experience", key: "experience", width: 15 },
      { header: "Message", key: "message", width: 40 },
      { header: "Submitted At", key: "submittedAt", width: 22 },
      { header: "Resume Name", key: "resumeName", width: 25 },
      { header: "Resume URL", key: "resumeUrl", width: 40 },
    ];

    careerSubmissions.forEach((c) => sheet.addRow(c));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "career_applications.xlsx");

    toast({ title: "Excel exported" });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Form Submissions</h1>

        <Tabs defaultValue="contact">
          <TabsList>
            <TabsTrigger value="contact">
              <Mail className="w-4 h-4 mr-2" /> Contact ({contactSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="careers">
              <Briefcase className="w-4 h-4 mr-2" /> Careers ({careerSubmissions.length})
            </TabsTrigger>
          </TabsList>

          {/* CONTACT */}
          <TabsContent value="contact" className="space-y-4">
            {contactSubmissions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex justify-between flex-row">
                  <CardTitle>{s.name}</CardTitle>
                  <Button size="sm" variant="destructive" onClick={() => deleteContact(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent><p>Email: {s.email} <br/> Number: {s.phone} <br /> {s.subject}</p></CardContent>
                <CardContent>{s.message}</CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* CAREERS */}
          <TabsContent value="careers" className="space-y-4">

            <div className="flex justify-end">
              <Button variant="outline" onClick={exportCareersExcel}>
                <Download className="w-4 h-4 mr-2" /> Export Excel
              </Button>
            </div>

            {careerSubmissions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex justify-between flex-row">
                  <div>
                    <CardTitle>{s.name} <Badge className="mt-2">{s.position}</Badge></CardTitle>
                    <p>Email: {s.email} <br/> Number: {s.phone}</p>
                    

                    {s.resumeUrl && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => setPreviewUrl(s.resumeUrl!)}>
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>

                        <a href={s.resumeUrl} target="_blank">
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

                <CardContent>{s.message}</CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* PREVIEW */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[85%] h-[85%] rounded-lg relative">
            <Button size="sm" className="absolute top-3 right-3" onClick={() => setPreviewUrl(null)}>
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
