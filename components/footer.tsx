"use client"

import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram,
  Car,
  Shield,
  Truck,
  Wrench
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="text-white" style={{ backgroundColor: '#be141e' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/Generated_Image_September_13__2025_-_5_46PM-removebg-preview.png" 
                alt="RENAULT PA Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Votre partenaire de confiance pour les pièces détachées automobiles. 
              Qualité, fiabilité et service client exceptionnel depuis des années.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>


          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nos services</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Truck className="h-4 w-4 text-white" />
                <span>Livraison rapide 24h</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Shield className="h-4 w-4 text-white" />
                <span>Garantie 2 ans</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Wrench className="h-4 w-4 text-white" />
                <span>Installation professionnelle</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Car className="h-4 w-4 text-white" />
                <span>Pièces d'origine</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+216 50 134 993</p>
                  <p className="text-xs text-gray-400">Lun-Ven: 8h-18h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">contact@renaultpa.tn</p>
                  <p className="text-xs text-gray-400">Support technique</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Tunis, Tunisie</p>
                  <p className="text-xs text-gray-400">Zone industrielle</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Horaires d'ouverture</p>
                  <p className="text-xs text-gray-400">Lun-Sam: 8h-18h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Powered by Elevate Tank
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
