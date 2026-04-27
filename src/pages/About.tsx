import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Target, Eye, Award, Users, TrendingUp, Heart } from "lucide-react";
import teamImage from "@/assets/team-collab.jpg";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

const values = [
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for excellence in every project, delivering solutions that exceed expectations.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description:
      "Transparency and honesty guide our relationships with clients and team members.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description:
      "We embrace emerging technologies and creative approaches to solve complex problems.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Success is achieved through teamwork, open communication, and partnership.",
  },
];

const achievements = [{ year: "2025", milestone: "Company Founded" }];

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const adminTeam = JSON.parse(localStorage.getItem("admin_team") || "[]");
    setTeamMembers(adminTeam);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              About Nestgen Solutions
            </h1>
            <p className="text-xl text-muted-foreground">
              Building the future of technology, one innovation at a time. We're
              a passionate team dedicated to transforming businesses through
              cutting-edge software solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="p-8 border-border bg-card hover:shadow-hover transition-all">
              <div className="inline-flex p-3 rounded-xl bg-gradient-primary mb-6">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower businesses worldwide with innovative technology
                solutions that drive growth, efficiency, and competitive
                advantage. We're committed to delivering excellence in every
                project while building lasting partnerships with our clients.
              </p>
            </Card>

            <Card className="p-8 border-border bg-card hover:shadow-hover transition-all">
              <div className="inline-flex p-3 rounded-xl bg-gradient-primary mb-6">
                <Eye className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the global leader in software innovation, recognized for
                transforming industries through technology. We envision a future
                where our solutions enable businesses to achieve their full
                potential and make a positive impact on the world.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Meet Our Expert Team</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Our diverse team of developers, designers, and strategists
                  brings together decades of combined experience. We're united
                  by our passion for technology and commitment to client
                  success.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "10+ experienced professionals",
                    "Industry-certified experts",
                    "Agile development methodologies",
                    "Continuous learning culture",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-primary-foreground"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/careers">Join Our Team</Link>
                </Button>
              </div>

              <div className="relative">
                <img
                  src={teamImage}
                  alt="Our Team"
                  className="rounded-2xl shadow-hover w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card
                key={index}
                className="p-6 border-border bg-card text-center hover:shadow-hover transition-all hover:-translate-y-2"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-primary mb-4">
                  <value.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      {teamMembers.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Leadership Team</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Meet the experts driving innovation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member) => (
                <Card
                  key={member.id}
                  className="p-6 border-border bg-card hover:shadow-hover transition-all"
                >
                  {member.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our growth and success
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-6 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="text-2xl font-bold text-primary">{achievement.year}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-gradient-primary"></div>
                  </div>
                  <Card className="flex-grow p-4 border-border bg-card">
                    <p className="font-semibold">{achievement.milestone}</p>
                  </Card>
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
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Why Choose Nestgen Solutions?</h2>
            <p className="text-xl mb-8 opacity-90">
              We combine technical expertise, creative innovation, and unwavering
              commitment to deliver solutions that drive real business results.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">Start Your Project</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
