import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">PardonPath</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering Canadians to reclaim their futures through streamlined record suspension services.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@pardonpath.ca" className="hover:text-foreground transition">
                  support@pardonpath.ca
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:1-800-7276361" className="hover:text-foreground transition">
                  1-800-PARDON-1
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Toronto, Ontario, Canada</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-foreground transition">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-muted-foreground hover:text-foreground transition">Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-muted-foreground hover:text-foreground transition">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground transition">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-muted-foreground hover:text-foreground transition">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-muted-foreground hover:text-foreground transition">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-foreground transition">Contact</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-foreground transition">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-foreground transition">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-muted-foreground hover:text-foreground transition">FAQ</a>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.paroleboard.gc.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Parole Board of Canada
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} PardonPath. All rights reserved.</p>
          <p>
            Authorized by the{" "}
            <a
              href="https://www.paroleboard.gc.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition"
            >
              Parole Board of Canada
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
