import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import LogoSvg from "../assets/logo-svg.svg"

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-4">Social Media</h3>
            <div className="flex space-x-4">
              <a href="/" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="/" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="/" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="/" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <img
                src={LogoSvg || "/placeholder.svg"}
                alt="Eventify Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </div>

          {/* Venues Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg mb-4">Venues</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:underline">
                  India
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  USA
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Canada
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Dubai
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  UK
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Germany
                </a>
              </li>
            </ul>
          </div>

          {/* Suppliers Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg mb-4">Suppliers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:underline">
                  Photographers
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Decorators
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Venues Planner
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Choreographers
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Designers
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Makeup Artists
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-2">
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Careers
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-4">Newsletter</h3>
            <p className="mb-4">Subscribe To Get Latest Media Updates</p>
            <button className="bg-gray-200 text-black px-6 py-2 rounded hover:bg-gray-300 transition-colors">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer