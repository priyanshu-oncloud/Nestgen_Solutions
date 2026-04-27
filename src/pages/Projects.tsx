import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  tech: string[];
  results: string;
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, "projects");

    const unsubscribe = onValue(projectsRef, (snapshot) => {
      setLoading(false);

      if (!snapshot.exists()) {
        setProjects([]);
        setCategories(["All"]);
        return;
      }

      const data = snapshot.val();

      const mapped: Project[] = Object.entries(data).map(
        ([id, value]: any) => ({
          id,
          title: value.title,
          description: value.description,
          category: value.category,
          industry: value.industry,
          tech: value.techStack
            ? value.techStack.split(",").map((t: string) => t.trim())
            : [],
          results: value.result,
        })
      );

      setProjects(mapped);

      const uniqueCategories = Array.from(
        new Set(mapped.map((p) => p.category))
      );

      setCategories(["All", ...uniqueCategories]);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Our Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our successful projects and real-world solutions.
          </p>
        </div>
      </section>

      {/* Filters */}
      {categories.length > 1 && (
        <section className="py-12 bg-background sticky top-20 z-40 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading projects...
            </p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No projects found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group overflow-hidden border-border bg-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary">{project.category}</Badge>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary">
                      {project.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Industry
                      </p>
                      <p className="font-semibold text-sm">
                        {project.industry}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Technologies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-secondary rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Results
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {project.results}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "", label: "Projects Completed" },
                { number: "", label: "Happy Clients" },
                { number: "", label: "Countries Served" },
                { number: "98%", label: "Success Rate" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-primary text-primary-foreground text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90">
              Let's create something amazing together. Contact us to discuss your vision.
            </p>
            <Button variant="secondary" size="lg">
              Get in Touch
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
