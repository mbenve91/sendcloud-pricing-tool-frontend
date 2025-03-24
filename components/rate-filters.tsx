import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Columns } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Funzione per formattare i nomi dei paesi
const formatCountryName = (countryCode: string): string => {
  // Mappa dei codici paese ai nomi completi
  const countryNames: Record<string, string> = {
    'fr': 'Francia',
    'de': 'Germania',
    'it': 'Italia',
    'es': 'Spagna',
    'nl': 'Paesi Bassi',
    'be': 'Belgio',
    'at': 'Austria',
    'pt': 'Portogallo',
    'pl': 'Polonia',
    'se': 'Svezia',
    'us': 'Stati Uniti',
    'ca': 'Canada',
    'uk': 'Regno Unito',
    'ch': 'Svizzera',
    'au': 'Australia',
    'jp': 'Giappone',
    'cn': 'Cina',
    'sg': 'Singapore',
    'ae': 'Emirati Arabi Uniti',
    'br': 'Brasile'
  };
  
  // Restituisci il nome del paese se disponibile, altrimenti il codice in maiuscolo
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
};

// Tipi per le props
interface RateFiltersProps {
  filters: Record<string, string>;
  onFilterChange: (name: string, value: string) => void;
  carriers: any[];
  services: any[];
  activeTab: string;
  countryList: string[];
  onColumnsDialogOpen: () => void;
  includeFuelSurcharge: boolean;
  onFuelSurchargeChange: (checked: boolean) => void;
  onCalculateClick?: () => void;
}

const RateFilters = React.memo(({
  filters,
  onFilterChange,
  carriers,
  services,
  activeTab,
  countryList,
  onColumnsDialogOpen,
  includeFuelSurcharge,
  onFuelSurchargeChange,
  onCalculateClick
}: RateFiltersProps) => {
  // Determina se mostrare il filtro paese in base alla tab attiva
  const shouldShowCountryFilter = activeTab === "international";
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            <h3 className="font-medium">Filtri</h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Fuel Surcharge Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeFuelSurcharge}
                onCheckedChange={onFuelSurchargeChange}
                id="fuel-surcharge-toggle"
              />
              <Label htmlFor="fuel-surcharge-toggle" className="text-sm whitespace-nowrap">
                Includi Fuel
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onColumnsDialogOpen}
              className="flex items-center gap-1"
            >
              <Columns className="h-4 w-4" />
              <span>Colonne</span>
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-wrap items-start gap-3">
          {/* Market */}
          <div className="space-y-2 w-[120px]">
            <label htmlFor="market" className="text-sm font-medium">
              Mercato
            </label>
            <Select 
              value={filters.sourceCountry || "all"} 
              onValueChange={(value) => onFilterChange("sourceCountry", value)}
            >
              <SelectTrigger id="market">
                <SelectValue placeholder="Tutti i mercati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i mercati</SelectItem>
                <SelectItem value="it">Italia</SelectItem>
                <SelectItem value="es">Spagna</SelectItem>
                <SelectItem value="fr">Francia</SelectItem>
                <SelectItem value="de">Germania</SelectItem>
                <SelectItem value="nl">Paesi Bassi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Carrier */}
          <div className="space-y-2 w-[150px]">
            <label htmlFor="carrier" className="text-sm font-medium">
              Corriere
            </label>
            <Select 
              value={filters.carrierId || "all"} 
              onValueChange={(value) => onFilterChange("carrierId", value)}
            >
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Tutti i corrieri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i corrieri</SelectItem>
                {carriers.map(carrier => (
                  <SelectItem key={carrier._id} value={carrier._id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service */}
          <div className="space-y-2 w-[150px]">
            <label htmlFor="service" className="text-sm font-medium">
              Servizio
            </label>
            <Select 
              value={filters.service || "all"} 
              onValueChange={(value) => onFilterChange("service", value)}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Tutti i servizi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i servizi</SelectItem>
                {services.map(service => (
                  <SelectItem key={service._id} value={service._id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country - mostrato solo per spedizioni internazionali */}
          {shouldShowCountryFilter && (
            <div className="space-y-2 w-[150px]">
              <label htmlFor="country" className="text-sm font-medium">
                Paese
              </label>
              <Select 
                value={filters.country || "all"} 
                onValueChange={(value) => onFilterChange("country", value)}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Tutti i paesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i paesi</SelectItem>
                  {countryList.map(country => (
                    <SelectItem key={country} value={country}>
                      {formatCountryName(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Weight */}
          <div className="space-y-2 w-[120px]">
            <label htmlFor="weight" className="text-sm font-medium">
              Peso (kg)
            </label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={filters.weight || "1"}
              onChange={(e) => onFilterChange("weight", e.target.value)}
              className="h-10"
            />
          </div>

          {/* Volume */}
          <div className="space-y-2 w-[120px]">
            <label htmlFor="volume" className="text-sm font-medium">
              Volume
            </label>
            <Input
              id="volume"
              type="number"
              min="1"
              value={filters.volume || "1"}
              onChange={(e) => onFilterChange("volume", e.target.value)}
              className="h-10"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-2 w-[180px]">
            <label htmlFor="maxPrice" className="text-sm font-medium">
              Prezzo Max €
            </label>
            <div className="flex gap-2">
              <Input
                id="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice || ""}
                onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                className="h-10"
                placeholder="Nessun limite"
              />
              {filters.maxPrice && parseFloat(filters.maxPrice) > 0 && (
                <Button 
                  size="sm" 
                  className="h-10 whitespace-nowrap bg-gradient-to-r from-[#122857] to-[#1e3a80] text-white"
                  onClick={onCalculateClick}
                >
                  Calcola
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Aggiungiamo il displayName per il debug
RateFilters.displayName = "RateFilters";

export default RateFilters; 