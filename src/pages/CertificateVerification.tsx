import { useState } from "react";
import { ref, get } from "firebase/database";

import { database } from "@/firebase";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { ShieldCheck, ShieldX } from "lucide-react";

export default function CertificateVerification() {
  const [certificateNo, setCertificateNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const verifyCertificate = async () => {
    if (!certificateNo) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const certRef = ref(
        database,
        `certificate_verifications/${certificateNo}`
      );

      const snapshot = await get(certRef);

      if (snapshot.exists()) {
        setResult(snapshot.val());
      } else {
        setError("Certificate not found or invalid.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">

      {/* HERO */}
      <section className="py-24 bg-gradient-hero text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Internship Certificate Verification
        </h1>
        <p className="text-xl text-muted-foreground">
          Verify internship certificates issued by NestGen Solutions
        </p>
      </section>

      {/* VERIFICATION CARD */}
      <section className="py-24">
        <div className="max-w-xl mx-auto px-4">
          <Card className="p-8 text-center space-y-6">

            <Input
              placeholder="Enter Certificate Number (e.g. NGS-INT-2025-001)"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value.toUpperCase())}
            />

            <Button
              size="lg"
              className="w-full"
              onClick={verifyCertificate}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Certificate"}
            </Button>

            {/* SUCCESS */}
            {result && (
              <div className="mt-6 p-6 rounded-lg border bg-green-50 dark:bg-green-950">
                <ShieldCheck className="w-12 h-12 mx-auto text-green-600" />
                <h3 className="text-2xl font-bold mt-4 text-green-700">
                  Certificate Verified ✅
                </h3>

                <div className="mt-4 space-y-2 text-left">
                  <p><strong>Name:</strong> {result.name}</p>
                  <p><strong>Internship:</strong> {result.internship}</p>
                  <p><strong>Duration:</strong> {result.duration}</p>
                  <p><strong>Issued By:</strong> {result.issuedBy}</p>
                  <p><strong>Issued On:</strong> {result.issuedOn}</p>
                </div>

                <Badge className="mt-4">Valid Certificate</Badge>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-6 p-6 rounded-lg border bg-red-50 dark:bg-red-950">
                <ShieldX className="w-12 h-12 mx-auto text-red-600" />
                <h3 className="text-xl font-bold mt-4 text-red-700">
                  Certificate Not Valid ❌
                </h3>
                <p className="text-sm mt-2 text-muted-foreground">
                  {error}
                </p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
