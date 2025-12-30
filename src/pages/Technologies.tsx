import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const techCategories = [
  {
    category: "Frontend",
    description: "Building responsive, interactive user interfaces",
    technologies: [
      { name: "React", expertise: "Expert", description: "Modern UI library for building component-based applications" },
      { name: "Next.js", expertise: "Expert", description: "Full-stack React framework with SSR and SSG" },
      { name: "TypeScript", expertise: "Expert", description: "Type-safe JavaScript for scalable applications" },
      { name: "Vue.js", expertise: "Advanced", description: "Progressive JavaScript framework" },
      { name: "Angular", expertise: "Advanced", description: "Enterprise-grade frontend framework" },
      { name: "Tailwind CSS", expertise: "Expert", description: "Utility-first CSS framework" },
    ],
  },
  {
    category: "Backend",
    description: "Robust server-side solutions and APIs",
    technologies: [
      { name: "Node.js", expertise: "Expert", description: "JavaScript runtime for scalable server applications" },
      { name: "Python", expertise: "Expert", description: "Versatile language for web and data science" },
      { name: "Java", expertise: "Advanced", description: "Enterprise-grade backend development" },
      { name: "Go", expertise: "Advanced", description: "High-performance concurrent programming" },
      { name: "PHP", expertise: "Advanced", description: "Web development scripting language" },
      { name: "Express.js", expertise: "Expert", description: "Minimalist web framework for Node.js" },
    ],
  },
  {
    category: "Mobile",
    description: "Native and cross-platform mobile solutions",
    technologies: [
      { name: "React Native", expertise: "Expert", description: "Cross-platform mobile app development" },
      { name: "Flutter", expertise: "Expert", description: "Google's UI toolkit for mobile apps" },
      { name: "Swift", expertise: "Advanced", description: "Native iOS app development" },
      { name: "Kotlin", expertise: "Advanced", description: "Modern language for Android development" },
      { name: "Ionic", expertise: "Advanced", description: "Hybrid mobile app framework" },
    ],
  },
  {
    category: "Cloud & DevOps",
    description: "Infrastructure and deployment automation",
    technologies: [
      { name: "AWS", expertise: "Expert", description: "Amazon Web Services cloud platform" },
      { name: "Azure", expertise: "Advanced", description: "Microsoft cloud computing platform" },
      { name: "Google Cloud", expertise: "Advanced", description: "Google's cloud infrastructure" },
      { name: "Docker", expertise: "Expert", description: "Container platform for applications" },
      { name: "Kubernetes", expertise: "Expert", description: "Container orchestration system" },
      { name: "Terraform", expertise: "Advanced", description: "Infrastructure as code tool" },
    ],
  },
  {
    category: "Database",
    description: "Data storage and management solutions",
    technologies: [
      { name: "PostgreSQL", expertise: "Expert", description: "Advanced relational database" },
      { name: "MongoDB", expertise: "Expert", description: "NoSQL document database" },
      { name: "MySQL", expertise: "Expert", description: "Popular relational database" },
      { name: "Redis", expertise: "Advanced", description: "In-memory data structure store" },
      { name: "Elasticsearch", expertise: "Advanced", description: "Distributed search and analytics" },
    ],
  },
];

const expertiseColors = {
  Expert: "bg-gradient-primary text-primary-foreground",
  Advanced: "bg-accent text-accent-foreground",
  Intermediate: "bg-secondary text-secondary-foreground",
};

export default function Technologies() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Our Technology Stack
            </h1>
            <p className="text-xl text-muted-foreground">
              We leverage cutting-edge technologies and frameworks to build robust, scalable solutions that stand the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* Technologies Sections */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-20">
            {techCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">{category.category}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.technologies.map((tech, techIndex) => (
                    <Card 
                      key={techIndex}
                      className="p-6 border-border bg-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold">{tech.name}</h3>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${expertiseColors[tech.expertise as keyof typeof expertiseColors]}`}
                        >
                          {tech.expertise}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Certifications & Partnerships</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Our team holds industry-recognized certifications and maintains partnerships with leading technology providers
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "AWS Certified",
                "Google Cloud Partner",
                "Microsoft Azure Certified",
                "MongoDB Professional",
                "Red Hat Certified",
                "Oracle Partner",
                "Docker Certified",
                "Kubernetes Certified",
              ].map((cert, index) => (
                <Card key={index} className="p-6 border-border bg-card text-center hover:shadow-card transition-all">
                  <p className="font-semibold text-sm">{cert}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Development Principles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Code Quality",
                  description: "We follow industry best practices, code reviews, and automated testing to ensure high-quality, maintainable code.",
                },
                {
                  title: "Security First",
                  description: "Security is integrated into every stage of development, from design to deployment.",
                },
                {
                  title: "Performance Optimization",
                  description: "We build fast, efficient applications optimized for speed and resource usage.",
                },
                {
                  title: "Scalability",
                  description: "Our solutions are designed to scale seamlessly as your business grows.",
                },
                {
                  title: "Documentation",
                  description: "Comprehensive documentation ensures smooth handoffs and easy maintenance.",
                },
                {
                  title: "Continuous Learning",
                  description: "Our team stays current with emerging technologies and industry trends.",
                },
              ].map((principle, index) => (
                <Card key={index} className="p-6 border-border bg-card hover:shadow-hover transition-all">
                  <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                  <p className="text-muted-foreground text-sm">{principle.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Need Help Choosing the Right Technology?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Our experts can guide you in selecting the perfect technology stack for your project requirements.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/contact">Consult with Our Experts</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
