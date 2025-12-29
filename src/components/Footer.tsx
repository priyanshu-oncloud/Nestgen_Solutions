import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";
import logo from "@/assets/logo.webp";
import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

interface SettingsData {
  address: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
  websiteName: string;
}

export const Footer = () => {
  const [settings, setSettings] = useState<SettingsData>({
    address: "",
    email: "",
    phone: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    websiteName: "",
  });

  useEffect(() => {
    const settingsRef = ref(database, "settings");

    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      setSettings(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt={settings.websiteName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                {settings.websiteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Delivering innovative software solutions that transform businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/services" className="footer-link">Services</Link></li>
              <li><Link to="/projects" className="footer-link">Projects</Link></li>
              <li><Link to="/careers" className="footer-link">Careers</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Web Development</li>
              <li>Mobile App Development</li>
              <li>Cloud Solutions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">

              {settings.address && (
                <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                  <span>{settings.address}</span>
                </li>
              )}

              {settings.email && (
                <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${settings.email}`} className="hover:text-primary">
                    {settings.email}
                  </a>
                </li>
              )}

              {settings.phone && (
                <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${settings.phone}`} className="hover:text-primary">
                    {settings.phone}
                  </a>
                </li>
              )}

            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 {settings.websiteName}. All rights reserved.
          </p>

          <div className="flex space-x-4">
            {settings.linkedin && (
              <a href={settings.linkedin} className="text-muted-foreground hover:text-primary transition-colors" rel="noopener noreferrer"
                aria-label="Nestgen Solutions on LinkedIn"
                target="_blank">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {settings.twitter && (
              <a href={settings.twitter} className="text-muted-foreground hover:text-primary transition-colors" rel="noopener noreferrer"
                aria-label="Nestgen Solutions on Twitter"
                target="_blank">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} className="text-muted-foreground hover:text-primary transition-colors" rel="noopener noreferrer"
                aria-label="Nestgen Solutions on Instagram"
                target="_blank">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} className="text-muted-foreground hover:text-primary transition-colors" rel="noopener noreferrer"
                aria-label="Nestgen Solutions on Facebook"
                target="_blank">
                <Facebook className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
