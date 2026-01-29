import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "@/firebase";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX } from "lucide-react";

export default function CertificateVerification() {
  const params = useParams();
  const certFromUrl = params.certNo
    ? decodeURIComponent(params.certNo).trim().toUpperCase()
    : "";

  const [certificateNo, setCertificateNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const verifyCertificate = async (value?: string) => {
    const cert = (value || certificateNo).trim().toUpperCase();
    if (!cert) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      // ✅ Direct lookup (because key = certificateNo)
      const snap = await get(ref(database, `certificates/${cert}`));

      if (snap.exists()) {
        setResult(snap.val());
      } else {
        setError("Certificate not found or invalid.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Auto-verify when opened via QR URL
  useEffect(() => {
    if (certFromUrl) {
      setCertificateNo(certFromUrl);
      verifyCertificate(certFromUrl);
    }
  }, [certFromUrl]);

  return (
    <div className="min-h-screen pt-20">

      {/* VERIFY CARD */}
      <section className="py-24">
        <div className="max-w-xl mx-auto px-4">
          <Card className="p-8 space-y-6 text-center">

            <Input
              placeholder="Certificate Number (NGS-INT-2026-001)"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={() => verifyCertificate()}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Certificate"}
            </Button>

            {/* ✅ VERIFIED */}
            {result && (
              <div className="p-6 border bg-green-50 rounded-lg">
                <ShieldCheck className="w-12 h-12 mx-auto text-green-600" />
                <h3 className="text-xl font-bold mt-3 text-green-700">
                  Certificate Verified ✅
                </h3>

                <div className="mt-4 text-left space-y-1 text-black">
                  <p><b>Certificate No:</b> {result.certificateNo}</p>
                  <p><b>Name:</b> {result.name}</p>
                  <p><b>Role:</b> {result.role}</p>
                  <p><b>Company:</b> {result.company}</p>
                  <p><b>Duration:</b> {result.duration}</p>
                  <p><b>Start Date:</b> {result.startDate}</p>
                  <p><b>End Date:</b> {result.endDate}</p>
                  <p><b>Issued On:</b> {result.issueDate}</p>
                </div>

                <Badge className="mt-4 bg-green-600 text-white">
                  Valid Certificate
                </Badge>
              </div>
            )}

            {/* ❌ INVALID */}
            {error && (
              <div className="p-6 border bg-red-50 rounded-lg">
                <ShieldX className="w-12 h-12 mx-auto text-red-600" />
                <h3 className="text-lg font-bold mt-3 text-red-700">
                  Invalid Certificate ❌
                </h3>
                <p className="mt-2 text-sm">{error}</p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
