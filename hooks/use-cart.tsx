"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "react-toastify"

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

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (item: Rate) => {
        const currentCart = get().cartItems;
        const isItemInCart = currentCart.some(cartItem => cartItem.id === item.id);
        
        if (!isItemInCart) {
          set({ cartItems: [...currentCart, item] });
          
          toast.success(
            <div>
              <span>Rate added to cart!</span>
              <br />
              <a href="/cart" className="text-blue-500 underline">Go to cart</a>
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
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