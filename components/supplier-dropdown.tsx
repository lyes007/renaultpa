"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, X, Check } from "lucide-react"
import { SupplierLogo } from "@/components/supplier-logo"

interface SupplierDropdownProps {
  suppliers: string[]
  selectedSupplier: string
  onSupplierChange: (supplier: string) => void
  suppliersWithLogos: Set<string>
}

export function SupplierDropdown({
  suppliers,
  selectedSupplier,
  onSupplierChange,
  suppliersWithLogos
}: SupplierDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter suppliers to only show those with logos, then filter by search term
  const suppliersWithLogosOnly = suppliers.filter(supplier => 
    suppliersWithLogos.has(supplier)
  )
  
  const filteredSuppliers = suppliersWithLogosOnly.filter(supplier =>
    supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSupplierSelect = (supplier: string) => {
    onSupplierChange(supplier)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    onSupplierChange("")
    setIsOpen(false)
    setSearchTerm("")
  }

  const selectedSupplierName = selectedSupplier || "Tous les fournisseurs"

  return (
    <div className="supplier-dropdown" ref={dropdownRef}>
      <button
        className="supplier-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex items-center gap-2">
          {selectedSupplier ? (
            <SupplierLogo 
              supplierName={selectedSupplier} 
              size="medium"
              className="w-6 h-6"
            />
          ) : (
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <span className="text-sm font-bold">T</span>
            </div>
          )}
          <span className="truncate">{selectedSupplierName}</span>
        </div>
        <ChevronDown 
          className={`supplier-dropdown-chevron ${isOpen ? 'open' : ''}`} 
          size={16}
        />
      </button>

      {isOpen && (
        <div className="supplier-dropdown-menu">
          {/* Search */}
          <div className="supplier-dropdown-search">
            <div className="relative">
              <Search className="supplier-dropdown-search-icon" size={16} />
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          </div>

          {/* Clear option */}
          <button
            className="supplier-dropdown-clear"
            onClick={handleClear}
          >
            <X className="supplier-dropdown-clear-icon" size={16} />
            <span>Tous les fournisseurs</span>
            {!selectedSupplier && <Check className="w-4 h-4 text-primary ml-auto" />}
          </button>

          {/* Supplier list */}
          <div className="supplier-dropdown-list">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <button
                  key={supplier}
                  className={`supplier-dropdown-item ${selectedSupplier === supplier ? 'active' : ''}`}
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  <div className="supplier-dropdown-item-logo">
                    <SupplierLogo 
                      supplierName={supplier} 
                      size="medium"
                      className="w-6 h-6"
                    />
                  </div>
                  <span className="supplier-dropdown-item-text">{supplier}</span>
                  {selectedSupplier === supplier && (
                    <Check className="supplier-dropdown-item-check" size={16} />
                  )}
                </button>
              ))
            ) : (
              <div className="supplier-dropdown-no-results">
                Aucun fournisseur trouvé
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="supplier-dropdown-footer">
            {filteredSuppliers.length} fournisseur{filteredSuppliers.length > 1 ? 's' : ''} disponible{filteredSuppliers.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
