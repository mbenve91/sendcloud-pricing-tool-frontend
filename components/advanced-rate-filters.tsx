import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Columns, Plus, Minus, Star, Save, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Building } from "lucide-react";

// Tipi per il modello dei filtri
export interface FilterOption {
  id: string;
  name: string;
  code?: string;
  icon?: React.ReactNode;
  logoUrl?: string;
  metadata?: any;
}

export interface FilterCategory {
  id: string;
  label: string;
  description?: string;
  isMultiSelect?: boolean;
  options?: FilterOption[];
  expanded?: boolean;
}

export interface FilterValue {
  [key: string]: string | string[] | number | number[] | boolean;
}

export interface SavedFilterSet {
  id: string;
  name: string;
  values: FilterValue;
  isDefault?: boolean;
}

interface AdvancedRateFiltersProps {
  filters: FilterValue;
  onFilterChange: (category: string, value: any) => void;
  onFilterReset: () => void;
  carriers: any[];
  services: any[];
  activeTab: string;
  countryList: string[];
  onColumnsDialogOpen: () => void;
  includeFuelSurcharge: boolean;
  onFuelSurchargeChange: (checked: boolean) => void;
  onSaveFilterSet?: (name: string, values: FilterValue) => void;
  onLoadFilterSet?: (filterId: string) => void;
  savedFilterSets?: SavedFilterSet[];
}

// Funzione per formattare i nomi dei paesi
const formatCountryName = (countryCode: string | number): string => {
  // Converti a stringa se non lo è già
  const code = String(countryCode).toLowerCase();
  
  // Mappa dei codici paese ai nomi completi
  const countryNames: Record<string, string> = {
    'fr': 'France',
    'de': 'Germany',
    'it': 'Italy',
    'es': 'Spain',
    'nl': 'Netherlands',
    'be': 'Belgium',
    'at': 'Austria',
    'pt': 'Portugal',
    'pl': 'Poland',
    'se': 'Sweden',
    'us': 'United States',
    'ca': 'Canada',
    'uk': 'United Kingdom',
    'ch': 'Switzerland',
    'au': 'Australia',
    'jp': 'Japan',
    'cn': 'China',
    'sg': 'Singapore',
    'ae': 'United Arab Emirates',
    'br': 'Brazil'
  };
  
  // Restituisci il nome del paese se disponibile, altrimenti il codice in maiuscolo
  return countryNames[code] || String(countryCode).toUpperCase();
};

export const AdvancedRateFilters = React.memo(({
  filters,
  onFilterChange,
  onFilterReset,
  carriers,
  services,
  activeTab,
  countryList,
  onColumnsDialogOpen,
  includeFuelSurcharge,
  onFuelSurchargeChange,
  onSaveFilterSet,
  onLoadFilterSet,
  savedFilterSets = []
}: AdvancedRateFiltersProps) => {
  // State per sezioni di filtro espanse
  const [expandedSection, setExpandedSection] = useState<string>("primary");
  const [showSaveFilterPopover, setShowSaveFilterPopover] = useState(false);
  const [filterSetName, setFilterSetName] = useState("");
  
  // Nuovo stato per i filtri locali (non ancora applicati)
  const [localFilters, setLocalFilters] = useState<FilterValue>(filters);
  // Stato per indicare se ci sono modifiche non applicate
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  
  // Aggiorna i filtri locali quando cambiano i filtri esterni
  useEffect(() => {
    setLocalFilters(filters);
    setHasUnappliedChanges(false);
  }, [filters]);
  
  // Determina se mostrare il filtro paese in base alla tab attiva
  const shouldShowCountryFilter = activeTab === "international";
  
  // Funzione per gestire il cambiamento dei filtri locali
  const handleLocalFilterChange = (category: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: value
    }));
    setHasUnappliedChanges(true);
  };
  
  // Funzione per applicare tutti i filtri
  const applyFilters = () => {
    // Per ogni chiave in localFilters, chiama onFilterChange
    Object.entries(localFilters).forEach(([key, value]) => {
      // Applica il filtro solo se è diverso dal valore corrente nei filtri
      if (JSON.stringify(filters[key]) !== JSON.stringify(value)) {
        onFilterChange(key, value);
      }
    });
    setHasUnappliedChanges(false);
  };

  // Funzione per reimpostare i filtri locali
  const resetLocalFilters = () => {
    onFilterReset();
    setHasUnappliedChanges(false);
  };
  
  // Generiamo categorie di filtri
  const filterCategories: FilterCategory[] = [
    {
      id: "primary",
      label: "Primary Filters",
      description: "Main filters for rate search",
      expanded: true,
      isMultiSelect: false,
    },
    {
      id: "advanced",
      label: "Advanced Filters",
      description: "Advanced filter options for specific searches",
      expanded: false,
      isMultiSelect: false,
    },
    {
      id: "technical",
      label: "Technical Filters",
      description: "Technical filter options for expert users",
      expanded: false,
      isMultiSelect: false,
    },
  ];

  // Funzione per ottenere il numero di filtri attivi per categoria
  const getActiveFilterCount = (categoryId: string): number => {
    let count = 0;
    
    // Filtri primari
    if (categoryId === "primary") {
      if (Array.isArray(localFilters.carriers) && localFilters.carriers.length > 0) count++;
      if (Array.isArray(localFilters.services) && localFilters.services.length > 0) count++;
      if (localFilters.sourceCountry && localFilters.sourceCountry !== "all") count++;
      if (shouldShowCountryFilter && Array.isArray(localFilters.countries) && localFilters.countries.length > 0) count++;
      if (localFilters.weight && localFilters.weight !== "1") count++;
    }
    
    // Filtri avanzati
    else if (categoryId === "advanced") {
      if (localFilters.maxPrice && localFilters.maxPrice !== "") count++;
      if (localFilters.minMargin && localFilters.minMargin !== "") count++;
      if (localFilters.volume && localFilters.volume !== "100") count++;
      if (localFilters.serviceType && localFilters.serviceType !== "all") count++;
    }
    
    // Filtri tecnici
    else if (categoryId === "technical") {
      // Aggiungi qui conteggi per eventuali filtri tecnici
      if (localFilters.euType && localFilters.euType !== "all") count++;
      if (localFilters.isActive !== undefined) count++;
    }
    
    return count;
  };
  
  // Componente per i tag di filtro selezionati
  const FilterTags = () => {
    // Array per contenere tutti i filtri attivi
    const activeTags: {id: string, label: string, value: string, category: string}[] = [];
    
    // Otteniamo le informazioni sui filtri attivi
    
    // Carrier
    if (Array.isArray(localFilters.carriers) && localFilters.carriers.length > 0) {
      localFilters.carriers.forEach(carrierId => {
        const carrier = carriers.find(c => c._id === carrierId);
        if (carrier) {
          activeTags.push({
            id: `carrier-${carrierId}`,
            label: "Carrier",
            value: carrier.name,
            category: "primary"
          });
        }
      });
    }
    
    // Servizi
    if (Array.isArray(localFilters.services) && localFilters.services.length > 0) {
      localFilters.services.forEach(serviceId => {
        const service = services.find(s => s._id === serviceId);
        if (service) {
          activeTags.push({
            id: `service-${serviceId}`,
            label: "Service",
            value: service.name,
            category: "primary"
          });
        }
      });
    }
    
    // Mercato
    if (localFilters.sourceCountry && localFilters.sourceCountry !== "all") {
      activeTags.push({
        id: `market-${localFilters.sourceCountry}`,
        label: "Market",
        value: formatCountryName(localFilters.sourceCountry as string),
        category: "primary"
      });
    }
    
    // Paesi destinazione
    if (shouldShowCountryFilter && Array.isArray(localFilters.countries) && localFilters.countries.length > 0) {
      localFilters.countries.forEach(country => {
        activeTags.push({
          id: `country-${country}`,
          label: "Country",
          value: formatCountryName(country),
          category: "primary"
        });
      });
    }
    
    // Peso
    if (localFilters.weight && localFilters.weight !== "1") {
      activeTags.push({
        id: "weight",
        label: "Weight",
        value: `${localFilters.weight} kg`,
        category: "primary"
      });
    }
    
    // Prezzo massimo
    if (localFilters.maxPrice && localFilters.maxPrice !== "") {
      activeTags.push({
        id: "max-price",
        label: "Max Price",
        value: `${localFilters.maxPrice} €`,
        category: "advanced"
      });
    }
    
    // Margine minimo
    if (localFilters.minMargin && localFilters.minMargin !== "") {
      activeTags.push({
        id: "min-margin",
        label: "Min Margin",
        value: `${localFilters.minMargin}%`,
        category: "advanced"
      });
    }
    
    // Volume
    if (localFilters.volume && localFilters.volume !== "100") {
      activeTags.push({
        id: "volume",
        label: "Volume",
        value: `${localFilters.volume} shipments`,
        category: "advanced"
      });
    }
    
    // EU/Extra EU
    if (localFilters.euType && localFilters.euType !== "all") {
      activeTags.push({
        id: "eu-type",
        label: "Region",
        value: localFilters.euType === "eu" ? "EU Only" : "Extra EU Only",
        category: "technical"
      });
    }
    
    // Tipo servizio
    if (localFilters.serviceType && localFilters.serviceType !== "all") {
      const serviceTypes: Record<string, string> = {
        "normal": "Standard",
        "pudo": "Pickup Point",
        "locker": "Locker",
        "return": "Return",
        "other": "Other"
      };
      
      const serviceTypeValue = String(localFilters.serviceType);
      
      activeTags.push({
        id: "service-type",
        label: "Service Type",
        value: serviceTypes[serviceTypeValue] || serviceTypeValue,
        category: "advanced"
      });
    }
    
    // Se non ci sono tag attivi, non mostrare nulla
    if (activeTags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {activeTags.map(tag => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
            <span className="text-xs text-muted-foreground">{tag.label}:</span>
            <span className="text-xs font-medium">{tag.value}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1 hover:bg-muted"
              onClick={() => {
                // Rimuovi il filtro in base alla categoria
                if (tag.id.startsWith("carrier-")) {
                  const carrierId = tag.id.replace("carrier-", "");
                  const updatedCarriers = (localFilters.carriers as string[]).filter(id => id !== carrierId);
                  handleLocalFilterChange("carriers", updatedCarriers);
                } 
                else if (tag.id.startsWith("service-")) {
                  const serviceId = tag.id.replace("service-", "");
                  const updatedServices = (localFilters.services as string[]).filter(id => id !== serviceId);
                  handleLocalFilterChange("services", updatedServices);
                }
                else if (tag.id.startsWith("country-")) {
                  const country = tag.id.replace("country-", "");
                  const updatedCountries = (localFilters.countries as string[]).filter(c => c !== country);
                  handleLocalFilterChange("countries", updatedCountries);
                }
                else if (tag.id.startsWith("market-")) {
                  handleLocalFilterChange("sourceCountry", "all");
                }
                else if (tag.id === "weight") {
                  handleLocalFilterChange("weight", "1");
                }
                else if (tag.id === "max-price") {
                  handleLocalFilterChange("maxPrice", "");
                }
                else if (tag.id === "min-margin") {
                  handleLocalFilterChange("minMargin", "");
                }
                else if (tag.id === "volume") {
                  handleLocalFilterChange("volume", "100");
                }
                else if (tag.id === "eu-type") {
                  handleLocalFilterChange("euType", "all");
                }
                else if (tag.id === "service-type") {
                  handleLocalFilterChange("serviceType", "all");
                }
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {activeTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-muted-foreground"
            onClick={resetLocalFilters}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        )}
      </div>
    );
  };
  
  // Componente per la selezione multipla di carrier
  const CarrierMultiSelect = () => {
    const selectedCarriers = Array.isArray(localFilters.carriers) ? localFilters.carriers.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    const [open, setOpen] = useState(false);
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedCarriers.length === 0 ? (
              <span className="text-muted-foreground">All carriers</span>
            ) : (
              <span>{selectedCarriers.length} carriers selected</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search carrier..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No carrier found.</CommandEmpty>
              <CommandGroup>
                {carriers
                  .filter(carrier => 
                    carrier.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                    String(carrier._id).includes(searchValue)
                  )
                  .map(carrier => (
                    <CommandItem
                      key={carrier._id}
                      value={carrier._id}
                      onSelect={(currentValue) => {
                        const isSelected = selectedCarriers.includes(String(currentValue));
                        let updatedSelection: string[];
                        
                        if (isSelected) {
                          updatedSelection = selectedCarriers.filter(id => id !== String(currentValue));
                        } else {
                          updatedSelection = [...selectedCarriers, String(currentValue)];
                        }
                        
                        handleLocalFilterChange("carriers", updatedSelection);
                        // Non chiudiamo il popover dopo la selezione
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Checkbox
                        checked={selectedCarriers.includes(String(carrier._id))}
                        className="mr-2 h-4 w-4"
                      />
                      <div className="flex items-center gap-2">
                        {carrier.logoUrl ? (
                          <Image
                            src={carrier.logoUrl}
                            alt={carrier.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <Building className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{carrier.name}</span>
                      </div>
                    </CommandItem>
                  ))
                }
              </CommandGroup>
              {selectedCarriers.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        handleLocalFilterChange("carriers", []);
                        // Non chiudiamo il popover dopo la deselezione
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                      }}
                      className="justify-center text-center"
                    >
                      Deselect all
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };
  
  // Componente per la selezione multipla di servizi
  const ServiceMultiSelect = () => {
    const selectedServices = Array.isArray(localFilters.services) ? localFilters.services.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    const [open, setOpen] = useState(false);
    
    // Ottieni i corrieri selezionati come stringhe
    const selectedCarriers = Array.isArray(localFilters.carriers) ? localFilters.carriers.map(String) : [];
    
    // Filtra i servizi in base ai carrier selezionati - logica migliorata
    const filteredServices = services.filter(service => {
      // Se il servizio è già selezionato, mostralo sempre
      if (selectedServices.includes(String(service._id))) return true;
      
      // Se non ci sono corrieri selezionati, mostra tutti i servizi
      if (selectedCarriers.length === 0) return true;
      
      // Estrai l'ID del corriere dal servizio in modo più robusto
      let carrierId;
      
      if (typeof service.carrier === 'object' && service.carrier !== null) {
        // Se carrier è un oggetto, usa la proprietà _id
        carrierId = String(service.carrier._id);
      } else {
        // Altrimenti usa il valore direttamente, convertendolo in stringa
        carrierId = String(service.carrier);
      }
      
      // Controlla se questo servizio appartiene a uno dei corrieri selezionati
      return selectedCarriers.includes(carrierId);
    });
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedServices.length === 0 ? (
              <span className="text-muted-foreground">All services</span>
            ) : (
              <span>{selectedServices.length} services selected</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search service..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No service found.</CommandEmpty>
              <ScrollArea className="h-[200px]">
                <CommandGroup>
                  {filteredServices
                    .filter(service => 
                      service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                      (service.code && service.code.toLowerCase().includes(searchValue.toLowerCase())) ||
                      String(service._id).includes(searchValue)
                    )
                    .map(service => {
                      // Estrai corriere in modo più robusto
                      let carrierId;
                      if (typeof service.carrier === 'object' && service.carrier !== null) {
                        carrierId = service.carrier._id;
                      } else {
                        carrierId = service.carrier;
                      }
                      
                      const carrier = carriers.find(c => String(c._id) === String(carrierId));
                      
                      return (
                        <CommandItem
                          key={service._id}
                          value={service._id}
                          onSelect={(currentValue) => {
                            const isSelected = selectedServices.includes(String(currentValue));
                            let updatedSelection: string[];
                            
                            if (isSelected) {
                              updatedSelection = selectedServices.filter(id => id !== String(currentValue));
                            } else {
                              updatedSelection = [...selectedServices, String(currentValue)];
                            }
                            
                            handleLocalFilterChange("services", updatedSelection);
                            // Non chiudiamo il popover dopo la selezione
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <Checkbox
                            checked={selectedServices.includes(String(service._id))}
                            className="mr-2 h-4 w-4"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{service.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {carrier ? carrier.name : 'Unknown'}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })
                  }
                </CommandGroup>
              </ScrollArea>
              {selectedServices.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        handleLocalFilterChange("services", []);
                        // Non chiudiamo il popover dopo la deselezione
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                      }}
                      className="justify-center text-center"
                    >
                      Deselect all
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };
  
  // Componente per la selezione multipla di paesi
  const CountryMultiSelect = () => {
    const selectedCountries = Array.isArray(localFilters.countries) ? localFilters.countries.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    const [open, setOpen] = useState(false);
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedCountries.length === 0 ? (
              <span className="text-muted-foreground">All countries</span>
            ) : (
              <span>{selectedCountries.length} countries selected</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search country..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <ScrollArea className="h-[200px]">
                <CommandGroup>
                  {countryList
                    .filter(country => {
                      const countryName = formatCountryName(String(country)).toLowerCase();
                      const searchLower = searchValue.toLowerCase();
                      return countryName.includes(searchLower) || String(country).toLowerCase().includes(searchLower);
                    })
                    .map(country => (
                      <CommandItem
                        key={country}
                        value={country}
                        onSelect={(currentValue) => {
                          const isSelected = selectedCountries.includes(String(currentValue));
                          let updatedSelection: string[];
                          
                          if (isSelected) {
                            updatedSelection = selectedCountries.filter(id => id !== String(currentValue));
                          } else {
                            updatedSelection = [...selectedCountries, String(currentValue)];
                          }
                          
                          handleLocalFilterChange("countries", updatedSelection);
                          // Non chiudiamo il popover dopo la selezione
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Checkbox
                          checked={selectedCountries.includes(String(country))}
                          className="mr-2 h-4 w-4"
                        />
                        <span>{formatCountryName(String(country))}</span>
                      </CommandItem>
                    ))
                  }
                </CommandGroup>
              </ScrollArea>
              {selectedCountries.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        handleLocalFilterChange("countries", []);
                        // Non chiudiamo il popover dopo la deselezione
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                      }}
                      className="justify-center text-center"
                    >
                      Deselect all
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };
  
  // Componente per la gestione dei filtri salvati
  const SavedFiltersMenu = () => {
    return (
      <Popover open={showSaveFilterPopover} onOpenChange={setShowSaveFilterPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            <span>Saved Filters</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Save current filters</div>
            <div className="flex space-x-2">
              <Input 
                placeholder="Filter set name" 
                value={filterSetName}
                onChange={(e) => setFilterSetName(e.target.value)}
                className="h-8 text-sm"
              />
              <Button 
                size="sm" 
                disabled={!filterSetName.trim()}
                onClick={() => {
                  if (onSaveFilterSet && filterSetName) {
                    onSaveFilterSet(filterSetName.trim(), filters);
                    setFilterSetName("");
                    setShowSaveFilterPopover(false);
                  }
                }}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
            
            {savedFilterSets.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="text-sm font-medium mb-2">Your filters</div>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-1">
                    {savedFilterSets.map(filterSet => (
                      <div 
                        key={filterSet.id} 
                        className="flex justify-between items-center py-1"
                      >
                        <div className="flex items-center">
                          {filterSet.isDefault && <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />}
                          <span className="text-sm">{filterSet.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              if (onLoadFilterSet) {
                                onLoadFilterSet(filterSet.id);
                                setShowSaveFilterPopover(false);
                              }
                            }}
                          >
                            <span className="sr-only">Load filter</span>
                            <i className="i-heroicons-arrow-path h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            <h3 className="font-medium">Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            {onSaveFilterSet && (
              <SavedFiltersMenu />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onColumnsDialogOpen}
              className="flex items-center gap-1"
            >
              <Columns className="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
        
        {/* Filtri Primari - Sempre visibili */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h4 className="font-medium text-sm">Primary Filters</h4>
              {getActiveFilterCount("primary") > 0 && (
                <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                  {getActiveFilterCount("primary")}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-start gap-3 mt-2 bg-accent/5 p-3 rounded-md">
            {/* Market */}
            <div className="space-y-2 w-[150px]">
              <label htmlFor="market" className="text-sm font-medium">
                Market
              </label>
              <Select 
                value={localFilters.sourceCountry?.toString() || "all"} 
                onValueChange={(value) => handleLocalFilterChange("sourceCountry", value)}
              >
                <SelectTrigger id="market">
                  <SelectValue placeholder="All markets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All markets</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="nl">Netherlands</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Carrier - Multiselect */}
            <div className="space-y-2 w-[200px]">
              <label className="text-sm font-medium">
                Carriers
              </label>
              <CarrierMultiSelect />
            </div>

            {/* Service - Multiselect */}
            <div className="space-y-2 w-[200px]">
              <label className="text-sm font-medium">
                Services
              </label>
              <ServiceMultiSelect />
            </div>

            {/* Country - mostrato solo per spedizioni internazionali - Multiselect */}
            {shouldShowCountryFilter && (
              <div className="space-y-2 w-[200px]">
                <label className="text-sm font-medium">
                  Countries
                </label>
                <CountryMultiSelect />
              </div>
            )}

            {/* Weight */}
            <div className="space-y-2 w-[120px]">
              <label htmlFor="weight" className="text-sm font-medium">
                Weight (kg)
              </label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                step="0.1"
                value={localFilters.weight?.toString() || "1"}
                onChange={(e) => handleLocalFilterChange("weight", e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </div>
        
        {/* Accordion per filtri avanzati e tecnici */}
        <Accordion
          type="single"
          collapsible
          value={expandedSection}
          onValueChange={setExpandedSection}
          className="w-full"
        >
          {/* Filtri Avanzati */}
          <AccordionItem value="advanced" className="border-none rounded-md overflow-hidden">
            <AccordionTrigger className="py-2 px-3 hover:no-underline bg-muted/50 hover:bg-muted rounded-md">
              <div className="flex items-center">
                <span className="font-medium">Advanced Filters</span>
                {getActiveFilterCount("advanced") > 0 && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                    {getActiveFilterCount("advanced")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 px-3 pb-1 bg-accent/5 rounded-b-md mt-1">
              <div className="flex flex-wrap items-start gap-3">
                {/* Volume */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="volume" className="text-sm font-medium">
                    Monthly Volume
                  </label>
                  <Input
                    id="volume"
                    type="number"
                    min="1"
                    value={localFilters.volume?.toString() || "100"}
                    onChange={(e) => handleLocalFilterChange("volume", e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Max Price */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="maxPrice" className="text-sm font-medium">
                    Max Price €
                  </label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={localFilters.maxPrice?.toString() || ""}
                    onChange={(e) => handleLocalFilterChange("maxPrice", e.target.value)}
                    className="h-10"
                    placeholder="No limit"
                  />
                </div>
                
                {/* Min Margin */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="minMargin" className="text-sm font-medium">
                    Min Margin %
                  </label>
                  <Input
                    id="minMargin"
                    type="number"
                    min="0"
                    max="100"
                    value={localFilters.minMargin?.toString() || ""}
                    onChange={(e) => handleLocalFilterChange("minMargin", e.target.value)}
                    className="h-10"
                    placeholder="No limit"
                  />
                </div>
                
                {/* Service Type */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="serviceType" className="text-sm font-medium">
                    Service Type
                  </label>
                  <Select 
                    value={localFilters.serviceType?.toString() || "all"} 
                    onValueChange={(value) => handleLocalFilterChange("serviceType", value)}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="normal">Standard</SelectItem>
                      <SelectItem value="pudo">Pickup Point</SelectItem>
                      <SelectItem value="locker">Locker</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Filtri Tecnici */}
          <AccordionItem value="technical" className="border-none rounded-md overflow-hidden mt-2">
            <AccordionTrigger className="py-2 px-3 hover:no-underline bg-muted/50 hover:bg-muted rounded-md">
              <div className="flex items-center">
                <span className="font-medium">Technical Filters</span>
                {getActiveFilterCount("technical") > 0 && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                    {getActiveFilterCount("technical")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 px-3 pb-1 bg-accent/5 rounded-b-md mt-1">
              <div className="flex flex-wrap items-start gap-3">
                {/* EU Type - mostrato solo per spedizioni internazionali */}
                {shouldShowCountryFilter && (
                  <div className="space-y-2 w-[150px]">
                    <label htmlFor="euType" className="text-sm font-medium">
                      Region
                    </label>
                    <Select 
                      value={localFilters.euType?.toString() || "all"} 
                      onValueChange={(value) => handleLocalFilterChange("euType", value)}
                    >
                      <SelectTrigger id="euType">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All regions</SelectItem>
                        <SelectItem value="eu">EU Only</SelectItem>
                        <SelectItem value="extra_eu">Extra EU Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Fuel Surcharge Toggle */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuel-surcharge-toggle" className="text-sm font-medium">
                      Include Fuel Surcharge in prices
                    </Label>
                    <Switch
                      checked={includeFuelSurcharge}
                      onCheckedChange={onFuelSurchargeChange}
                      id="fuel-surcharge-toggle"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, fuel surcharge is included in the final price calculation.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Bottone per applicare i filtri */}
        <div className="mt-5 flex justify-between items-center">
          <Button 
            variant="default" 
            className="flex items-center gap-1" 
            onClick={applyFilters}
            disabled={!hasUnappliedChanges}
          >
            <Filter className="h-4 w-4 mr-1" />
            Apply Filters
          </Button>
          
          {hasUnappliedChanges && (
            <Badge className="bg-yellow-50 text-yellow-800 border border-yellow-200">
              Filters not applied
            </Badge>
          )}
        </div>
        
        {/* Azioni rapide e filtri attivi */}
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Active filters</span>
            {(getActiveFilterCount("primary") + getActiveFilterCount("advanced") + getActiveFilterCount("technical")) > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground"
                onClick={resetLocalFilters}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset filters
              </Button>
            )}
          </div>
          
          <FilterTags />
        </div>
      </CardContent>
    </Card>
  );
});

// Aggiungiamo il displayName per il debug
AdvancedRateFilters.displayName = "AdvancedRateFilters";

export default AdvancedRateFilters; 