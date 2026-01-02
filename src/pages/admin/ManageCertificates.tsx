import { useEffect, useState } from "react";
import {
  ref,
  set,
  runTransaction,
  onValue,
  remove,
} from "firebase/database";
import { database } from "@/firebase";

import * as XLSX from "xlsx";

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
  name: string;
  role: string;
  startDate: string;
  endDate: string;
}

interface Certificate extends CertForm {
  certificateNo: string;
  company: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingCertNo, setEditingCertNo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* 🔍 Search & Filter */
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [form, setForm] = useState<CertForm>({
    name: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  /* 🔄 Fetch certificates */
  useEffect(() => {
    const certRef = ref(database, "certificates");
    return onValue(certRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setCertificates([]);

      const list: Certificate[] = Object.values(data);
      list.sort((a, b) => b.createdAt - a.createdAt);
      setCertificates(list);
    });
  }, []);

  /* 🔍 Filter */
  const filteredCertificates = certificates.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.certificateNo.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)) &&
      (roleFilter ? c.role === roleFilter : true)
    );
  });

  /* 📄 Pagination */
  const totalPages = Math.ceil(
    filteredCertificates.length / ROWS_PER_PAGE
  );
  const currentRows = filteredCertificates.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  /* ✏ Edit */
  const handleEdit = (cert: Certificate) => {
    setForm({
      name: cert.name,
      role: cert.role,
      startDate: cert.startDate,
      endDate: cert.endDate,
    });
    setEditingCertNo(cert.certificateNo);
    setIsEditing(true);
    setShowForm(true);
  };

  /* ⬇ Download */
  const handleDownload = async (cert: Certificate) => {
    const qr = await generateQR(cert.verifyUrl);
    const pdf = await generateCertificatePDF(
      {
        name: cert.name,
        role: cert.role,
        startDate: cert.startDate,
        endDate: cert.endDate,
        certificateNo: cert.certificateNo,
        company: cert.company,
        duration: cert.duration,
        issueDate: cert.issueDate,
      },
      qr
    );
    pdf.save(`${cert.certificateNo}.pdf`);
  };

  /* 🗑 DELETE */
  const handleDelete = async (certNo: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    await remove(ref(database, `certificates/${certNo}`));
    if (editingCertNo === certNo) {
      setShowForm(false);
      setEditingCertNo(null);
      setIsEditing(false);
    }
  };

  /* 📤 Export Excel */
  const exportExcel = () => {
    if (!filteredCertificates.length) {
      alert("No data to export");
      return;
    }

    const data = filteredCertificates.map((c) => ({
      "Certificate No": c.certificateNo,
      Name: c.name,
      Role: c.role,
      Company: c.company,
      "Start Date": c.startDate,
      "End Date": c.endDate,
      Duration: c.duration,
      "Issue Date": c.issueDate,
      "Verify URL": c.verifyUrl,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");
    XLSX.writeFile(workbook, "certificates.xlsx");
  };

  /* 💾 Save (Add + Edit) */
  const save = async () => {
    if (!form.name || !form.role || !form.startDate || !form.endDate) {
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

      /* ===== EDIT ===== */
      if (editingCertNo) {
        await set(ref(database, `certificates/${editingCertNo}`), {
          certificateNo: editingCertNo,
          name: form.name.trim(),
          role: form.role.toUpperCase(),
          company: COMPANY_NAME,
          startDate: form.startDate,
          endDate: form.endDate,
          duration,
          issueDate,
          verifyUrl: `${window.location.origin}/certificate-verification/${editingCertNo}`,
          createdAt: Date.now(),
        });
      }

      /* ===== ADD ===== */
      else {
        const year = new Date().getFullYear();
        const counterRef = ref(database, `counters/certificates/${year}`);
        const tx = await runTransaction(counterRef, (v) => (v || 0) + 1);

        const seq = String(tx.snapshot.val()).padStart(3, "0");
        const certificateNo = `NGS-INT-${year}-${seq}`;

        await set(ref(database, `certificates/${certificateNo}`), {
          certificateNo,
          name: form.name.trim(),
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

      setForm({ name: "", role: "", startDate: "", endDate: "" });
      setEditingCertNo(null);
      setIsEditing(false);
      setShowForm(false);
      setPage(1);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            Manage Certificates
          </h1>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          )}
        </div>

        {/* ===== FORM ===== */}
        {showForm && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Certificate" : "Add Certificate"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Student Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={save} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditingCertNo(null);
                    setForm({
                      name: "",
                      role: "",
                      startDate: "",
                      endDate: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== SEARCH / FILTER ===== */}
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search certificate / name / role"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Input
            placeholder="Filter by role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value.toUpperCase());
              setPage(1);
            }}
          />
          <Button variant="outline" onClick={exportExcel}>
            Export Excel
          </Button>
        </div>

        {/* ===== DESKTOP TABLE ===== */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentRows.map((c) => (
                <TableRow key={c.certificateNo}>
                  <TableCell>{c.certificateNo}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.role}</Badge>
                  </TableCell>
                  <TableCell>{c.duration}</TableCell>
                  <TableCell>{c.issueDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(c)}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
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

        {/* ===== MOBILE CARDS ===== */}
        <div className="md:hidden space-y-4">
          {currentRows.map((c) => (
            <Card key={c.certificateNo}>
              <CardContent className="space-y-2 p-4">
                <p className="font-semibold">{c.certificateNo}</p>
                <p>{c.name}</p>
                <Badge>{c.role}</Badge>
                <p>{c.duration}</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleDownload(c)}>
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(c.certificateNo)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ===== PAGINATION ===== */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>

      </div>
    </AdminLayout>
  );
}
