"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

interface CartStore {
  cartItems: Rate[];
  addToCart: (item: Rate) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
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