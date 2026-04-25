import { useEffect, useState } from "react";
import {
  ref,
  set,
  runTransaction,
  onValue,
  off,
  remove,
} from "firebase/database";
import { database } from "@/firebase";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

import { generateQR } from "@/utils/generateQR";
import { generateCertificatePDF } from "@/utils/generateCertificatePDF";

/* ---------------- TYPES ---------------- */

interface CertForm {
  names: string[];
  role: string;
  startDate: string;
  endDate: string;
}

interface Certificate {
  certificateNo: string;
  name: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  duration: string;
  issueDate: string;
  verifyUrl: string;
  createdAt: number;
}

const COMPANY_NAME = "Nestgen Solutions";
const ROWS_PER_PAGE = 50;

/* ---------------- HELPERS ---------------- */

function monthsBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  let months =
    (e.getFullYear() - s.getFullYear()) * 12 +
    (e.getMonth() - s.getMonth());

  if (e.getDate() < s.getDate()) months--;
  return Math.max(1, months);
}

/* ---------------- COMPONENT ---------------- */

export default function ManageCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CertForm>({
    names: [""],
    role: "",
    startDate: "",
    endDate: "",
  });

  /* 🔄 Fetch */
  useEffect(() => {
    const certRef = ref(database, "certificates");

    onValue(certRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setCertificates([]);

      const list: Certificate[] = Object.values(data);
      list.sort((a, b) => b.createdAt - a.createdAt);
      setCertificates(list);
    });

    return () => off(certRef);
  }, []);

  /* 📄 Pagination */
  const currentRows = certificates.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  /* 🧠 Name Handlers */
  const addNameField = () => {
    setForm({ ...form, names: [...form.names, ""] });
  };

  const removeNameField = (index: number) => {
    const updated = [...form.names];
    updated.splice(index, 1);
    setForm({ ...form, names: updated });
  };

  const updateName = (index: number, value: string) => {
    const updated = [...form.names];
    updated[index] = value;
    setForm({ ...form, names: updated });
  };

  /* 💾 SAVE MULTIPLE */
  const save = async () => {
    if (
      form.names.some((n) => !n) ||
      !form.role ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const durationMonths = monthsBetween(
        form.startDate,
        form.endDate
      );

      const duration = `${durationMonths} Month${
        durationMonths > 1 ? "s" : ""
      }`;

      const issueDate = new Date().toISOString().split("T")[0];
      const year = new Date().getFullYear();

      for (const name of form.names) {
        const counterRef = ref(database, `counters/certificates/${year}`);
        const tx = await runTransaction(counterRef, (v) => (v || 0) + 1);

        const seq = String(tx.snapshot.val()).padStart(3, "0");
        const certificateNo = `NGS-INT-${year}-${seq}`;

        await set(ref(database, `certificates/${certificateNo}`), {
          certificateNo,
          name: name.trim(),
          role: form.role.toUpperCase(),
          company: COMPANY_NAME,
          startDate: form.startDate,
          endDate: form.endDate,
          duration,
          issueDate,
          verifyUrl: `${window.location.origin}/certificate-verification/${certificateNo}`,
          createdAt: Date.now(),
        });
      }

      setForm({
        names: [""],
        role: "",
        startDate: "",
        endDate: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ⬇ Download */
  const handleDownload = async (cert: Certificate) => {
    const qr = await generateQR(cert.verifyUrl);
    const pdf = await generateCertificatePDF(cert, qr);
    pdf.save(`${cert.certificateNo}.pdf`);
  };

  /* 🗑 Delete */
  const handleDelete = async (certNo: string) => {
    if (!confirm("Delete this certificate?")) return;
    await remove(ref(database, `certificates/${certNo}`));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Manage Certificates</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Certificate
          </Button>
        </div>

        {/* FORM */}
        {showForm && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Add Certificates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* MULTIPLE NAMES */}
              <div className="space-y-2">
                {form.names.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Student ${index + 1} Name`}
                      value={name}
                      onChange={(e) =>
                        updateName(index, e.target.value)
                      }
                    />

                    {form.names.length > 1 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeNameField(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addNameField}>
                  ➕ Add Another Name
                </Button>
              </div>

              <Input
                placeholder="Role"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              />

              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />

              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />

              <Button onClick={save} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>

            </CardContent>
          </Card>
        )}

        {/* TABLE */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRows.map((c) => (
              <TableRow key={c.certificateNo}>
                <TableCell>{c.certificateNo}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  <Badge>{c.role}</Badge>
                </TableCell>
                <TableCell>{c.duration}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleDownload(c)}>
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(c.certificateNo)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </AdminLayout>
  );
}