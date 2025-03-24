"use client";

import { FC, useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWithTimeout } from '@/data/fallbackData';

export interface Carrier {
  _id: string;
  name: string;
  logoUrl: string | null;
}

interface CarrierSelectorProps {
  onSelect: (carrier: Carrier) => void;
  selectedCarrierId?: string;
}

const CarrierSelector: FC<CarrierSelectorProps> = ({ onSelect, selectedCarrierId }) => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  
  // Fetch carriers only once when component mounts
  useEffect(() => {
    // Skip if we've already initialized
    if (hasInitialized.current) return;
    
    const fetchCarriers = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching carriers...");
        
        // Utilizziamo la funzione fetchWithTimeout centralizata
        const response = await fetchWithTimeout('/api/carriers');
        
        // Controlla se la risposta è OK prima di tentare di analizzare il JSON
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Gestione sicura del parsing JSON
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          throw new Error("Error parsing server response");
        }
        
        if (data.success && Array.isArray(data.data)) {
          console.log(`Loaded ${data.data.length} carriers`);
          setCarriers(data.data);
          
          // Only select a carrier if we don't have one selected yet
          if (data.data.length > 0) {
            if (!selectedCarrierId) {
              // No carrier selected, choose the first one
              onSelect(data.data[0]);
            } else {
              // We have a selected ID, verify it exists in the loaded data
              const selectedCarrier = data.data.find((c: Carrier) => c._id === selectedCarrierId);
              if (!selectedCarrier) {
                // If the selected ID doesn't exist, fall back to the first carrier
                onSelect(data.data[0]);
              }
            }
          }
        } else {
          console.error("Invalid data format received:", data);
          throw new Error("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching carriers:", error);
        // Non interrompere il rendering in caso di errore
      } finally {
        setIsLoading(false);
        hasInitialized.current = true;
      }
    };

    fetchCarriers();
  // No dependencies - this should run only once when component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update carrier list when selectedCarrierId changes, without fetching again
  useEffect(() => {
    if (!hasInitialized.current || carriers.length === 0) return;
    
    if (selectedCarrierId) {
      // Check if the selected carrier exists in our loaded list
      const exists = carriers.some(c => c._id === selectedCarrierId);
      if (!exists && carriers.length > 0) {
        // If it doesn't exist, fall back to the first carrier
        onSelect(carriers[0]);
      }
    }
  // This effect only runs when selectedCarrierId changes and we already have carriers loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarrierId, carriers]);

  if (isLoading && !hasInitialized.current) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select
      value={selectedCarrierId}
      onValueChange={(value) => {
        const carrier = carriers.find(c => c._id === value);
        if (carrier) {
          onSelect(carrier);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a carrier" />
      </SelectTrigger>
      <SelectContent>
        {carriers.length > 0 ? (
          carriers.map((carrier) => (
            <SelectItem key={carrier._id} value={carrier._id} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {carrier.logoUrl ? (
                    <AvatarImage src={carrier.logoUrl} alt={carrier.name} />
                  ) : (
                    <AvatarFallback className="bg-secondary">
                      <Bot size={16} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{carrier.name}</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-carriers" disabled>
            Nessun corriere disponibile
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default CarrierSelector; 