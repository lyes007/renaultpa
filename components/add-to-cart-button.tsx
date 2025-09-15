"use client"

import { useState } from "react"
import { ShoppingCart, Package } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { getStockStatus } from "@/lib/stock-data"
import { useNotification } from "@/contexts/notification-context"

interface AddToCartButtonProps {
  articleId: number
  articleName: string
  articleNo: string
  supplierName: string
  price?: number
  stockData?: any
  image?: string
}

export function AddToCartButton({ 
  articleId, 
  articleName, 
  articleNo, 
  supplierName, 
  price, 
  stockData,
  image
}: AddToCartButtonProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useCart()
  const { addNotification } = useNotification()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the product card click
    
    if (isClicked) return // Prevent multiple clicks during animation
    
    setIsClicked(true)
    
    // Add item to cart using the cart hook
    if (price && price > 0) {
      addItem({
        articleId,
        name: articleName,
        price,
        quantity: 1,
        image: image || '',
        supplier: supplierName,
        articleNo
      })
      
      // Show success notification
      addNotification({
        message: `${articleName} ajouté au panier`,
        type: 'success',
        duration: 3000
      })
    }
    
    // Reset animation after completion
    setTimeout(() => {
      setIsClicked(false)
      setIsAdded(true)
      
      // Reset "Added" state after a delay
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    }, 1500)
  }

  // Determine if product is out of stock (Sur commande)
  const stockStatus = stockData ? getStockStatus(stockData.stock) : { text: 'Sur commande', color: '#F59E0B', isInStock: false, priority: 2 }
  const isOutOfStock = !stockStatus.isInStock

  return (
    <button 
      className={`cart-button ${isClicked ? 'clicked' : ''}`}
      onClick={handleClick}
      disabled={isOutOfStock}
      style={{
        opacity: isOutOfStock ? 0.5 : 1,
        cursor: isOutOfStock ? 'not-allowed' : 'pointer'
      }}
      title={isOutOfStock ? 'Produit sur commande - Non disponible' : 'Ajouter au panier'}
    >
      <span className="add-to-cart">
        {isOutOfStock ? 'Sur commande' : 'Ajouter au panier'}
      </span>
      <span className="added">Ajouté !</span>
      <ShoppingCart className="fa-shopping-cart" size={16} />
      <Package className="fa-box" size={12} />
    </button>
  )
}
