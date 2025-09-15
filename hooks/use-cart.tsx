"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react"

export interface CartItem {
  id: number
  articleId: number
  name: string
  price: number
  quantity: number
  image: string
  supplier: string
  articleNo: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }

// Load initial state from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], isOpen: false }
  }
  
  try {
    const saved = localStorage.getItem('cart-data')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        items: parsed.items || [],
        isOpen: false // Always start with cart closed
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }
  
  return { items: [], isOpen: false }
}

const initialState: CartState = loadCartFromStorage()

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('cart-data', JSON.stringify({
      items: state.items,
      // Don't save isOpen state
    }))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(item => item.articleId === action.payload.articleId)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.articleId === action.payload.articleId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, id: Date.now() }],
      }
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      }
    
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      }
    
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }
    
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    
    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }
    
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveCartToStorage(state)
  }, [state.items]) // Only save when items change, not when isOpen changes

  const addItem = (item: Omit<CartItem, "id">) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, id: Date.now() } })
  }

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
