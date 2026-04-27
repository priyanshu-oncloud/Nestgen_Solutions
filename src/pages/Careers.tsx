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

import {
  Briefcase,
  Users,
  Award,
  Coffee,
  TrendingUp
} from "lucide-react";

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

/* ---------------- COMPONENT ---------------- */

export default function Careers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resume: null as File | null,
    message: "",
  });

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resume) {
      toast({ title: "Please upload resume (PDF)", variant: "destructive" });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      /* ---------- 1️⃣ UPLOAD RESUME ---------- */
      const fileName = `${Date.now()}_${formData.resume.name}`;
      const resumeRef = storageRef(storage, `resumes/${fileName}`);
      await uploadBytes(resumeRef, formData.resume);
      const resumeUrl = await getDownloadURL(resumeRef);

      /* ---------- 2️⃣ SAVE TO DATABASE ---------- */
      const submission = {
        name: formatName(formData.name), // ✅ formatted here
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        resumeName: formData.resume.name,
        resumeUrl,
        message: formData.message,
        submittedAt: new Date().toISOString(),
      };

      await push(dbRef(database, "careers_applications"), submission);

      /* ---------- 3️⃣ SEND EMAIL ---------- */
      try {
        await axios.post(
          "https://us-central1-nestgen-solutions.cloudfunctions.net/sendCareerConfirmation",
          {
            ...submission,
          }
        );
      } catch (emailError) {
        console.warn("Email failed but data saved:", emailError);
      }

      /* ---------- SUCCESS ---------- */
      toast({
        title: "Application Submitted!",
        description: "Your application has been received successfully.",
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

    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: "Please try again later",
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
            <h2 className="text-3xl font-bold mb-6 text-center">Apply Now</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

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

                {/* PHONE FIX */}
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

                {/* POSITION SELECT */}
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
                {loading ? "Uploading..." : "Submit Application"}
              </Button>

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