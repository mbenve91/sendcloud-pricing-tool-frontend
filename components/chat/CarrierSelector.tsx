"use client";

import { FC, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const response = await fetch('/api/carriers');
        const data = await response.json();
        
        if (data.success && data.data) {
          setCarriers(data.data);
          
          // Select first carrier by default if none is selected
          if (!selectedCarrierId && data.data.length > 0) {
            onSelect(data.data[0]);
          } else if (selectedCarrierId && data.data.length > 0) {
            const selectedCarrier = data.data.find((c: Carrier) => c._id === selectedCarrierId);
            if (selectedCarrier) {
              onSelect(selectedCarrier);
            } else {
              onSelect(data.data[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching carriers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarriers();
  }, [selectedCarrierId, onSelect]);

  if (isLoading) {
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
        {carriers.map((carrier) => (
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
        ))}
      </SelectContent>
    </Select>
  );
};

export default CarrierSelector; 