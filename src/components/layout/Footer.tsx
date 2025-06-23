
import { Button } from "@/components/ui/button";
import { Github, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
  compact?: boolean;
}

export const Footer = ({ className, compact = false }: FooterProps) => {
  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms of Service", path: "/terms-of-service" },
    { label: "Support", path: "/support" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className={cn("border-t bg-background z-10 w-full", 
      compact ? "py-2" : "py-4", 
      className
    )}>
      <div className={cn(
        "container mx-auto px-4 w-full", 
        compact ? "max-w-full" : "max-w-full"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-2 md:gap-3">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size={compact ? "icon" : "sm"}
                className={cn(
                  "hover:text-foreground",
                  compact ? "h-7 w-7" : "h-8 w-8"
                )}
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-2 text-center md:text-right">
          <p className="text-xs text-muted-foreground">
            ©2025 FileSecureAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
