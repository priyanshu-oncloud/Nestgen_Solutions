import { useEffect, useState } from "react";
import { ref, set, onValue, off, remove, update } from "firebase/database";
import { database } from "@/firebase";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Power } from "lucide-react";

interface Coupon {
  code: string;
  discountType: "flat" | "percent";
  discountValue: number;
  active: boolean;
  usageLimit: number; // 0 = unlimited
  usedCount: number;
  expiresAt?: string;
  createdAt: string;
}

const emptyForm = {
  code: "",
  discountType: "flat" as "flat" | "percent",
  discountValue: "",
  usageLimit: "",
  expiresAt: "",
};

export default function ManageCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = ref(database, "coupons");
    const cb = onValue(r, (snap) => {
      setCoupons(snap.val() || {});
    });
    return () => off(r, "value", cb);
  }, []);

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return toast({ title: "Enter coupon code", variant: "destructive" });
    if (!/^[A-Z0-9_-]{3,20}$/.test(code))
      return toast({ title: "Invalid code", description: "3-20 chars: A-Z, 0-9, _ or -", variant: "destructive" });

    const value = Number(form.discountValue);
    if (!value || value <= 0)
      return toast({ title: "Enter valid discount value", variant: "destructive" });
    if (form.discountType === "percent" && value > 100)
      return toast({ title: "Percent must be ≤ 100", variant: "destructive" });

    if (coupons[code])
      return toast({ title: "Code already exists", variant: "destructive" });

    setLoading(true);
    try {
      const data: Coupon = {
        code,
        discountType: form.discountType,
        discountValue: value,
        active: true,
        usageLimit: Number(form.usageLimit) || 0,
        usedCount: 0,
        expiresAt: form.expiresAt || undefined,
        createdAt: new Date().toISOString(),
      };
      await set(ref(database, `coupons/${code}`), data);
      toast({ title: "Coupon created", description: code });
      setForm(emptyForm);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to create", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    await remove(ref(database, `coupons/${code}`));
    toast({ title: "Deleted", description: code });
  };

  const handleToggle = async (code: string, active: boolean) => {
    await update(ref(database, `coupons/${code}`), { active: !active });
  };

  const list = Object.values(coupons).sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Coupons</h1>
          <p className="text-muted-foreground">Create discount codes for the careers registration fee.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create New Coupon
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Code</label>
              <Input
                placeholder="e.g. WELCOME50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Discount Type</label>
              <Select
                value={form.discountType}
                onValueChange={(v) => setForm({ ...form, discountType: v as "flat" | "percent" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Discount Value {form.discountType === "flat" ? "(₹)" : "(%)"}
              </label>
              <Input
                type="number"
                placeholder={form.discountType === "flat" ? "e.g. 50" : "e.g. 25"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Usage Limit (0 = unlimited)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Expires At (optional)</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Coupons ({list.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {list.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No coupons yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((c) => (
                    <TableRow key={c.code}>
                      <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                      <TableCell>
                        {c.discountType === "flat"
                          ? `₹${c.discountValue}`
                          : `${c.discountValue}%`}
                      </TableCell>
                      <TableCell>
                        {c.usedCount}/{c.usageLimit === 0 ? "∞" : c.usageLimit}
                      </TableCell>
                      <TableCell>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.active ? "default" : "secondary"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggle(c.code, c.active)}>
                          <Power className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.code)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
