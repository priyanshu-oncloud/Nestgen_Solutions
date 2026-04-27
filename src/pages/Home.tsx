import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Link } from "react-router-dom";
import { ArrowRight, Code2 } from "lucide-react";
import * as Icons from "lucide-react";

interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  message: string;
  rating: number;
}

export default function Home() {
  const [displayServices, setDisplayServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [animate, setAnimate] = useState(false);

  /* ================= DEFER FIREBASE ================= */
  useEffect(() => {
    requestIdleCallback(async () => {
      const { ref, onValue } = await import("firebase/database");
      const { database } = await import("@/firebase");

      /* -------- SERVICES -------- */
      const servicesRef = ref(database, "services");

      const unsubscribeServices = onValue(servicesRef, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const mapped = Object.entries(data)
          .slice(0, 5)
          .map(([_, value]: any) => {
            const IconComponent = (Icons as any)[value.icon] || Code2;

            return {
              icon: IconComponent,
              title: value.title,
              description: value.description,
              features: [],
            };
          });

        setDisplayServices(mapped);
      });

      /* -------- TESTIMONIALS -------- */
      const testimonialsRef = ref(database, "testimonials");

      const unsubscribeTestimonials = onValue(testimonialsRef, (snapshot) => {
        if (!snapshot.exists()) {
          setTestimonials([]);
          return;
        }

        const data = snapshot.val();
        const list = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));

        setTestimonials(list.reverse());
      });

      return () => {
        unsubscribeServices();
        unsubscribeTestimonials();
      };
    });
  }, []);

  /* Enable animations AFTER first paint */
  useEffect(() => {
    window.addEventListener("load", () => setAnimate(true));
  }, []);

  const techLogos = [
    "React",
    "Node.js",
    "Python",
    "AWS",
    "TypeScript",
    "Docker",
    "Kubernetes",
    "TensorFlow",
  ];

  return (
    <main>
      <div className="min-h-screen">

        {/* ================= HERO (LCP FIXED) ================= */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden text-white">

          {/* Decorative blobs (non-blocking) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-primary/25 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 py-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center">

              {/* LCP ELEMENT – no delay */}
              <h1
                id="lcp-text"
                className="text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-primary bg-clip-text text-transparent"
              >
                Transform Your Business <br />
                with Innovative Technology
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10">
                We deliver next-generation software solutions that drive growth,
                scalability, and digital excellence.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-5 justify-center ${
                  animate ? "animate-fade-in-up" : ""
                }`}
              >
                <Button
                  size="lg"
                  className="bg-gradient-primary text-white shadow-primary hover:scale-105 transition"
                  asChild
                >
                  <Link to="/contact">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-black transition"
                  asChild
                >
                  <Link to="/services">Explore Services</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
                {[
                  { number: "500+", label: "Projects Delivered" },
                  { number: "150+", label: "Happy Clients" },
                  { number: "50+", label: "Team Members" },
                  { number: "98%", label: "Client Satisfaction" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Services
              </h2>
              <p className="text-xl text-muted-foreground">
                Comprehensive technology solutions tailored to your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayServices.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link to="/services">
                  View All Services <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ================= TECHNOLOGIES ================= */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Technologies We Master
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {techLogos.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-6 bg-card border border-border rounded-xl hover:shadow-hover hover:-translate-y-1 transition"
                >
                  <span className="font-semibold">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        {testimonials.length > 0 && (
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold">
                  What Our Clients Say
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.slice(0, 3).map((t) => (
                  <TestimonialCard key={t.id} {...t} />
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
