import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Link } from "react-router-dom";
import { 
  ArrowRight,
  Smartphone,
  Cloud,
  Palette,
  Settings, 
  Code2,
} from "lucide-react";
import * as Icons from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

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

  useEffect(() => {
    /* ================= SERVICES ================= */
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

    /* ================= TESTIMONIALS ================= */
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
  }, []);

  const techLogos = [
  "React", "Node.js", "Python", "AWS", "TypeScript", "Docker", "Kubernetes", "TensorFlow"
];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,.85)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Transform Your Business with Innovative Technology <br/><br/>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              We deliver cutting-edge software solutions that drive growth and digital excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { number: "500+", label: "Projects Delivered" },
                { number: "150+", label: "Happy Clients" },
                { number: "50+", label: "Team Members" },
                { number: "98%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Services Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive technology solutions tailored to your business needs
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

      {/* Technologies Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Technologies We Master</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leveraging the latest and most powerful technologies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {techLogos.map((tech, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-card border border-border rounded-xl hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              >
                <span className="font-semibold text-foreground">{tech}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/technologies">Explore Our Tech Stack</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss how we can help transform your business with innovative technology solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">Contact Us Today</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/projects">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
