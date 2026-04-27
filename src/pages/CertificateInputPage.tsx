import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CertificateInputPage() {
  const [certNo, setCertNo] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (!certNo.trim()) return;

    navigate(
      `/certificate-verification/${encodeURIComponent(
        certNo.trim().toUpperCase()
      )}`
    );
  };

  return (
    <div className="min-h-screen pt-20">
      {/* HERO */}
      <section className="py-24 text-center bg-gradient-hero">
        <h1 className="text-5xl font-bold">
          Internship Certificate Verification
        </h1>
      </section>

      {/* VERIFY CARD */}
      <section className="py-24">
        <div className="max-w-xl mx-auto px-4">
          <Card className="p-8 space-y-6 text-center">
            <h1 className="text-2xl font-bold">
                Internship Certificate Verification
              </h1>

              <Input
                placeholder="Certificate Number (NGS-INT-2026-001)"
                value={certNo}
                onChange={(e) => setCertNo(e.target.value)}
              />

              <Button className="w-full" onClick={handleVerify}>
                Verify Certificate
              </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
