import { useState } from "react";
import axios from "axios";

import { ref as dbRef, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/firebase";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Briefcase, Users, Award, Coffee, TrendingUp, CreditCard, CircleCheck as CheckCircle2 } from "lucide-react";

/* ---------------- RAZORPAY TYPES ---------------- */

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* ---------------- CONSTANTS ---------------- */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const APPLICATION_FEE = 99; // INR
const APPLICATION_FEE_PAISE = 9900; // paise

/* ---------------- BENEFITS ---------------- */

const benefits = [
  { icon: TrendingUp, title: "Career Growth", description: "Training budget and certification support" },
  { icon: Coffee, title: "Work-Life Balance", description: "Flexible hours and remote work options" },
  { icon: Award, title: "Competitive Salary", description: "Market-leading compensation packages" },
  { icon: Users, title: "Great Team", description: "Collaborative and supportive work environment" },
  { icon: Briefcase, title: "Latest Tech", description: "Work with cutting-edge technologies" },
];

/* ---------------- POSITIONS ---------------- */

const positions = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Analyst",
  "DevOps Engineer",
  "Intern",
];

/* ---------------- NAME FORMAT FUNCTION ---------------- */

const formatName = (name: string) => {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* ---------------- LOAD RAZORPAY SCRIPT ---------------- */

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* ---------------- COMPONENT ---------------- */

export default function Careers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resume: null as File | null,
    message: "",
  });

  /* ---------------- VALIDATE FORM BEFORE PAYMENT ---------------- */

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return false;
    }
    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.position) {
      toast({ title: "Please select a position", variant: "destructive" });
      return false;
    }
    if (!formData.resume) {
      toast({ title: "Please upload resume (PDF)", variant: "destructive" });
      return false;
    }
    return true;
  };

  /* ---------------- INITIATE PAYMENT ---------------- */

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({ title: "Failed to load payment gateway", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create order via edge function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: formatName(formData.name),
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          amount: APPLICATION_FEE_PAISE,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        toast({ title: "Failed to create payment order", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Nestgen Solutions",
        description: `Application Fee - ${formData.position}`,
        order_id: orderData.orderId,
        prefill: {
          name: formatName(formData.name),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#6C63FF",
        },
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch(`${SUPABASE_URL}/functions/v1/razorpay/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              setPaymentDone(true);
              setPaymentId(response.razorpay_payment_id);
              setOrderId(response.razorpay_order_id);
              toast({
                title: "Payment Successful!",
                description: "Now submitting your application...",
              });
              submitApplication();
            } else {
              toast({
                title: "Payment Verification Failed",
                description: "If money was deducted, it will be refunded in 5-7 days.",
                variant: "destructive",
              });
              setLoading(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast({
              title: "Payment verification error",
              description: "Please contact support if money was deducted.",
              variant: "destructive",
            });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({ title: "Payment cancelled", variant: "destructive" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({ title: "Payment failed to initiate", variant: "destructive" });
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT APPLICATION (AFTER PAYMENT) ---------------- */

  const submitApplication = async () => {
    try {
      /* ---------- 1. UPLOAD RESUME ---------- */
      const fileName = `${Date.now()}_${formData.resume!.name}`;
      const resumeStorageRef = storageRef(storage, `resumes/${fileName}`);
      await uploadBytes(resumeStorageRef, formData.resume!);
      const resumeUrl = await getDownloadURL(resumeStorageRef);

      /* ---------- 2. SAVE TO DATABASE ---------- */
      const submission = {
        name: formatName(formData.name),
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        resumeName: formData.resume!.name,
        resumeUrl,
        message: formData.message,
        paymentId,
        orderId,
        paymentAmount: APPLICATION_FEE,
        submittedAt: new Date().toISOString(),
      };

      await push(dbRef(database, "careers_applications"), submission);

      /* ---------- 3. SEND EMAIL ---------- */
      try {
        await axios.post(
          "https://us-central1-nestgen-solutions.cloudfunctions.net/sendCareerConfirmation",
          { ...submission }
        );
      } catch (emailError) {
        console.warn("Email failed but data saved:", emailError);
      }

      /* ---------- SUCCESS ---------- */
      toast({
        title: "Application Submitted!",
        description: "Your application and payment have been received successfully.",
      });

      /* ---------- RESET ---------- */
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resume: null,
        message: "",
      });
      setPaymentDone(false);
      setPaymentId("");
      setOrderId("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "Payment was successful but application save failed. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen pt-20">

      {/* HERO */}
      <section className="py-24 bg-gradient-hero text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Join Our Team
        </h1>
        <p className="text-xl text-muted-foreground">
          Build your career with passionate innovators shaping the future.
        </p>
      </section>

      {/* BENEFITS */}
      <section className="py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <Card key={i} className="p-6">
              <b.icon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-2 text-center">Apply Now</h2>
            <p className="text-center text-muted-foreground mb-6">
              Application fee: <span className="font-bold text-foreground">Rs. {APPLICATION_FEE}</span>
            </p>

            {/* Payment success banner */}
            {paymentDone && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-500">Payment Successful</p>
                  <p className="text-sm text-muted-foreground">Payment ID: {paymentId}</p>
                </div>
              </div>
            )}

            <form onSubmit={initiatePayment} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  required
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  placeholder="Phone (10 digits)"
                  value={formData.phone}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                />
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    setFormData({ ...formData, position: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos, i) => (
                      <SelectItem key={i} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  placeholder="Experience"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
                <Input
                  required
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resume: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <Textarea
                required
                rows={6}
                placeholder="Cover letter / Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {loading ? "Processing..." : `Pay Rs. ${APPLICATION_FEE} & Submit Application`}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By clicking above, you will be redirected to Razorpay for secure payment.
                Your application will be submitted after successful payment.
              </p>

            </form>
          </Card>
        </div>
      </section>

      {/* CULTURE */}
      <section className="py-24 bg-gradient-primary text-primary-foreground text-center">
        <h2 className="text-4xl font-bold mb-6">Our Culture</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["Innovation", "Collaboration", "Growth", "Integrity", "Excellence"].map((v, i) => (
            <Badge key={i} variant="secondary" className="px-4 py-2">
              {v}
            </Badge>
          ))}
        </div>
      </section>

    </div>
  );
}
