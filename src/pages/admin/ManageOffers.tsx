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

/* ✅ ShadCN Select */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { generateOfferLetterPDF } from "@/utils/generateOfferLetterPDF";

/* ---------------- TYPES ---------------- */

interface OfferForm {
  names: string[];
  position: string;
  startDate: string;
  endDate: string;
  stipendType: "PAID" | "UNPAID" | "";
  stipendAmount: string;
}

interface Offer {
  name: string;
  position: string;
  startDate: string;
  endDate: string;
  stipendType: string;
  stipendAmount: string;
  offerNo: string;
  company: string;
  issueDate: string;
  stipendText: string;
  createdAt: number;
}

const COMPANY_NAME = "Nestgen Solutions";
const ROWS_PER_PAGE = 50;

/* ---------------- COMPONENT ---------------- */

export default function ManageOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<OfferForm>({
    names: [""],
    position: "",
    startDate: "",
    endDate: "",
    stipendType: "",
    stipendAmount: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  /* 🔄 Fetch */
  useEffect(() => {
    const offerRef = ref(database, "offers");

    onValue(offerRef, (snap) => {
      const data = snap.val();
      if (!data) return setOffers([]);

      const list: Offer[] = Object.values(data);
      list.sort((a, b) => b.createdAt - a.createdAt);
      setOffers(list);
    });

    return () => off(offerRef);
  }, []);

  /* 📄 Pagination */
  const currentRows = offers.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  /* 🧠 Name Field Handlers */
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

  /* 💾 Save (MULTIPLE OFFERS) */
  const save = async () => {
    if (
      form.names.some((n) => !n) ||
      !form.position ||
      !form.startDate ||
      !form.endDate ||
      !form.stipendType
    ) {
      alert("Fill all fields");
      return;
    }

    const year = new Date().getFullYear();

    for (const name of form.names) {
      const counterRef = ref(database, `counters/offers/${year}`);
      const tx = await runTransaction(counterRef, (v) => (v || 0) + 1);

      const seq = String(tx.snapshot.val()).padStart(3, "0");
      const offerNo = `NGS-OFFER-${year}-${seq}`;

      const issueDate = new Date().toISOString().split("T")[0];

      const stipendText =
        form.stipendType === "PAID"
          ? `₹${form.stipendAmount}/month`
          : "Unpaid (Training and resources included)";

      await set(ref(database, `offers/${offerNo}`), {
        name,
        position: form.position.toUpperCase(),
        startDate: form.startDate,
        endDate: form.endDate,
        stipendType: form.stipendType,
        stipendAmount: form.stipendAmount,
        offerNo,
        company: COMPANY_NAME,
        issueDate,
        stipendText,
        createdAt: Date.now(),
      });
    }

    /* Reset */
    setForm({
      names: [""],
      position: "",
      startDate: "",
      endDate: "",
      stipendType: "",
      stipendAmount: "",
    });

    setShowForm(false);
  };

  /* ⬇ Download */
  const handleDownload = async (o: Offer) => {
    const pdf = await generateOfferLetterPDF(o);
    pdf.save(`${o.name}.pdf`);
  };

  /* 🗑 Delete */
  const handleDelete = async (offerNo: string) => {
    if (!confirm("Delete this offer?")) return;
    await remove(ref(database, `offers/${offerNo}`));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Manage Offers</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Offer
          </Button>
        </div>

        {/* FORM */}
        {showForm && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Add Offer Letter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* ✅ MULTIPLE NAME INPUTS */}
              <div className="space-y-2">
                {form.names.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Candidate ${index + 1} Name`}
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
                placeholder="Position"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
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

              {/* ✅ SELECT FIX */}
              <Select
                value={form.stipendType}
                onValueChange={(value) =>
                  setForm({ ...form, stipendType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Stipend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              {form.stipendType === "PAID" && (
                <Input
                  placeholder="Amount (₹)"
                  value={form.stipendAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stipendAmount: e.target.value,
                    })
                  }
                />
              )}

              <Button onClick={save}>Save</Button>

            </CardContent>
          </Card>
        )}

        {/* TABLE */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Stipend</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRows.map((o) => (
              <TableRow key={o.offerNo}>
                <TableCell>{o.offerNo}</TableCell>
                <TableCell>{o.name}</TableCell>
                <TableCell>
                  <Badge>{o.position}</Badge>
                </TableCell>
                <TableCell>{o.stipendText}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleDownload(o)}>
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(o.offerNo)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </AdminLayout>
  );
}