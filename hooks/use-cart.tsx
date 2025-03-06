"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Rate {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierLogo: string;
  serviceCode: string;
  serviceName: string;
  serviceDescription: string;
  countryName?: string;
  basePrice: number;
  userDiscount: number;
  finalPrice: number;
  actualMargin: number;
  marginPercentage: number;
  adjustedMargin?: number;
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  fuelSurcharge: number;
  volumeDiscount: number;
  promotionDiscount: number;
  totalBasePrice: number;
  weightRanges?: any[];
  currentWeightRange?: any;
  retailPrice?: number;
  purchasePrice?: number;
  margin?: number;
  weightMin?: number;
  weightMax?: number;
  service?: {
    _id?: string;
    name?: string;
  };
  isWeightRange?: boolean;
  parentRateId?: string;
}

interface CartStore {
  cartItems: Rate[];
  addToCart: (item: Rate) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

// Funzione che può essere utilizzata dal componente per mostrare il toast
export function showCartNotification(toast: any) {
  toast({
    title: "Rate added to cart!",
    description: (
      <div className="mt-2">
        <span>Shipping rate successfully added to your cart</span>
        <div className="mt-2">
          <Link href="/cart" className="text-blue-500 hover:text-blue-700 underline">
            Go to cart
          </Link>
        </div>
      </div>
    ),
    duration: 5000,
  });
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (item: Rate) => {
        const currentCart = get().cartItems;
        const isItemInCart = currentCart.some(cartItem => cartItem.id === item.id);
        
        if (!isItemInCart) {
          set({ cartItems: [...currentCart, item] });
          // Non mostriamo più il toast qui, ma lo esponiamo come funzione separata
        }
      },
      
      removeFromCart: (id: string) => {
        set({ cartItems: get().cartItems.filter(item => item.id !== id) });
      },
      
      clearCart: () => {
        set({ cartItems: [] });
      },
      
      isInCart: (id: string) => {
        return get().cartItems.some(item => item.id === id);
      }
    }),
    {
      name: "cart-storage",
    }
  )
); 