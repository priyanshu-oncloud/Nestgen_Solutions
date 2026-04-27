import { useEffect, useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

import {
  Code2,
  Globe,
  Zap,
  Shield,
  LucideIcon,
} from "lucide-react";

import * as Icons from "lucide-react";

import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

/* ---------- TYPES ---------- */
interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  keyPoints: string[];
}

type FirebaseService = {
  title: string;
  description: string;
  icon: string;
  keyPoints?: string[] | Record<string, string>;
};

/* ---------- PROCESS STEPS ---------- */
const processSteps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "Understanding your business goals, challenges, and requirements.",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "Creating a detailed roadmap and technical architecture.",
  },
  {
    number: "03",
    title: "Development",
    description:
      "Building your solution with agile methodologies and best practices.",
  },
  {
    number: "04",
    title: "Testing",
    description:
      "Rigorous quality assurance and user acceptance testing.",
  },
  {
    number: "05",
    title: "Deployment",
    description:
      "Launching your solution with minimal disruption.",
  },
  {
    number: "06",
    title: "Support",
    description:
      "Ongoing maintenance and optimization for continued success.",
  },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesRef = ref(database, "services");

    const unsubscribe = onValue(servicesRef, (snapshot) => {
      setLoading(false);

      if (!snapshot.exists()) {
        setServices([]);
        return;
      }

      const data = snapshot.val();

      const mapped: Service[] = Object.entries(data).map(
        ([id, value]) => {
          const service = value as FirebaseService;

          // 🔹 ICON HANDLING
          const iconName = service.icon as keyof typeof Icons;
          const IconComponent: LucideIcon =
            (Icons[iconName] as LucideIcon) || Code2;

          // 🔹 KEY POINTS FIX (Firebase object → array)
          const keyPoints = service.keyPoints
            ? Array.isArray(service.keyPoints)
              ? service.keyPoints
              : Object.values(service.keyPoints)
            : [];

          return {
            id,
            title: service.title,
            description: service.description,
            icon: IconComponent,
            keyPoints,
          };
        }
      );

      setServices(mapped);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen pt-20">

      {/* HERO */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive technology solutions designed to accelerate your
            digital transformation.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading services...
            </p>
          ) : services.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No services available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    features={service.keyPoints}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Our Development Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A proven methodology that ensures project success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <Card key={step.number} className="p-6 bg-card">
                <div className="text-5xl font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Our Services Stand Out
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Globe,
                    title: "Global Standards",
                    description:
                      "We follow international best practices and industry standards.",
                  },
                  {
                    icon: Zap,
                    title: "Fast Delivery",
                    description:
                      "Agile methodologies ensure rapid development without compromising quality.",
                  },
                  {
                    icon: Shield,
                    title: "Security First",
                    description:
                      "Built-in security measures protect your applications and data.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="inline-flex p-2 rounded-lg bg-gradient-primary">
                      <item.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 bg-gradient-primary text-primary-foreground">
              <h3 className="text-2xl font-bold mb-4">
                Need a Custom Solution?
              </h3>
              <p className="mb-6 opacity-90">
                Every business is unique. Let’s create a tailored
                solution for your goals.
              </p>
              <Button variant="secondary" size="lg" asChild className="w-full">
                <Link to="/contact">Request a Consultation</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Let’s discuss your project and create real impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/projects">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
