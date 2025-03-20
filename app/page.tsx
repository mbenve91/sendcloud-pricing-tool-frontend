"use client";

import { useState, useEffect } from "react";
import RateComparisonCard from "@/components/rate-comparison-card"
import ChatWidget from "@/components/chat/ChatWidget"
import { useAuth } from "@/providers/AuthProvider";

export default function Home() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await fetch('/api/carriers');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setCarriers(data.data);
          // Default to the first carrier
          setSelectedCarrier(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching carriers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarriers();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Logout button in top right corner */}
      <div className="fixed top-4 right-4">
        <button
          onClick={handleLogout}
          className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
      
      <div className="w-full max-w-7xl">
        <RateComparisonCard />
      </div>
      
      {/* ChatWidget - only render when a carrier is selected */}
      {selectedCarrier && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWidget 
            carrier={{
              _id: selectedCarrier._id,
              name: selectedCarrier.name,
              logoUrl: selectedCarrier.logoUrl
            }}
          />
        </div>
      )}
    </main>
  )
}

