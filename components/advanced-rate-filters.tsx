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
  
  // Determina se mostrare il filtro paese in base alla tab attiva
  const shouldShowCountryFilter = activeTab === "international";
  
  // Generiamo categorie di filtri
  const filterCategories: FilterCategory[] = [
    {
      id: "primary",
      label: "Filtri Primari",
      description: "Filtri principali per la ricerca di tariffe",
      expanded: true,
      isMultiSelect: false,
    },
    {
      id: "advanced",
      label: "Filtri Avanzati",
      description: "Opzioni di filtro avanzate per ricerche specifiche",
      expanded: false,
      isMultiSelect: false,
    },
    {
      id: "technical",
      label: "Filtri Tecnici",
      description: "Opzioni di filtro tecniche per utenti esperti",
      expanded: false,
      isMultiSelect: false,
    },
  ];

  // Funzione per ottenere il numero di filtri attivi per categoria
  const getActiveFilterCount = (categoryId: string): number => {
    let count = 0;
    
    // Filtri primari
    if (categoryId === "primary") {
      if (Array.isArray(filters.carriers) && filters.carriers.length > 0) count++;
      if (Array.isArray(filters.services) && filters.services.length > 0) count++;
      if (filters.sourceCountry && filters.sourceCountry !== "all") count++;
      if (shouldShowCountryFilter && Array.isArray(filters.countries) && filters.countries.length > 0) count++;
      if (filters.weight && filters.weight !== "1") count++;
    }
    
    // Filtri avanzati
    else if (categoryId === "advanced") {
      if (filters.maxPrice && filters.maxPrice !== "") count++;
      if (filters.minMargin && filters.minMargin !== "") count++;
      if (filters.volume && filters.volume !== "100") count++;
      if (filters.serviceType && filters.serviceType !== "all") count++;
    }
    
    // Filtri tecnici
    else if (categoryId === "technical") {
      // Aggiungi qui conteggi per eventuali filtri tecnici
      if (filters.euType && filters.euType !== "all") count++;
      if (filters.isActive !== undefined) count++;
    }
    
    return count;
  };
  
  // Componente per i tag di filtro selezionati
  const FilterTags = () => {
    // Array per contenere tutti i filtri attivi
    const activeTags: {id: string, label: string, value: string, category: string}[] = [];
    
    // Otteniamo le informazioni sui filtri attivi
    
    // Carrier
    if (Array.isArray(filters.carriers) && filters.carriers.length > 0) {
      filters.carriers.forEach(carrierId => {
        const carrier = carriers.find(c => c._id === carrierId);
        if (carrier) {
          activeTags.push({
            id: `carrier-${carrierId}`,
            label: "Corriere",
            value: carrier.name,
            category: "primary"
          });
        }
      });
    }
    
    // Servizi
    if (Array.isArray(filters.services) && filters.services.length > 0) {
      filters.services.forEach(serviceId => {
        const service = services.find(s => s._id === serviceId);
        if (service) {
          activeTags.push({
            id: `service-${serviceId}`,
            label: "Servizio",
            value: service.name,
            category: "primary"
          });
        }
      });
    }
    
    // Mercato
    if (filters.sourceCountry && filters.sourceCountry !== "all") {
      activeTags.push({
        id: `market-${filters.sourceCountry}`,
        label: "Mercato",
        value: formatCountryName(filters.sourceCountry as string),
        category: "primary"
      });
    }
    
    // Paesi destinazione
    if (shouldShowCountryFilter && Array.isArray(filters.countries) && filters.countries.length > 0) {
      filters.countries.forEach(country => {
        activeTags.push({
          id: `country-${country}`,
          label: "Paese",
          value: formatCountryName(country),
          category: "primary"
        });
      });
    }
    
    // Peso
    if (filters.weight && filters.weight !== "1") {
      activeTags.push({
        id: "weight",
        label: "Peso",
        value: `${filters.weight} kg`,
        category: "primary"
      });
    }
    
    // Prezzo massimo
    if (filters.maxPrice && filters.maxPrice !== "") {
      activeTags.push({
        id: "max-price",
        label: "Prezzo Max",
        value: `${filters.maxPrice} €`,
        category: "advanced"
      });
    }
    
    // Margine minimo
    if (filters.minMargin && filters.minMargin !== "") {
      activeTags.push({
        id: "min-margin",
        label: "Margine Min",
        value: `${filters.minMargin}%`,
        category: "advanced"
      });
    }
    
    // Volume
    if (filters.volume && filters.volume !== "100") {
      activeTags.push({
        id: "volume",
        label: "Volume",
        value: `${filters.volume} spedizioni`,
        category: "advanced"
      });
    }
    
    // EU/Extra EU
    if (filters.euType && filters.euType !== "all") {
      activeTags.push({
        id: "eu-type",
        label: "Regione",
        value: filters.euType === "eu" ? "Solo EU" : "Solo Extra EU",
        category: "technical"
      });
    }
    
    // Tipo servizio
    if (filters.serviceType && filters.serviceType !== "all") {
      const serviceTypes: Record<string, string> = {
        "normal": "Standard",
        "pudo": "Punto di Ritiro",
        "locker": "Locker",
        "return": "Reso",
        "other": "Altro"
      };
      
      const serviceTypeValue = String(filters.serviceType);
      
      activeTags.push({
        id: "service-type",
        label: "Tipo Servizio",
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
                  const updatedCarriers = (filters.carriers as string[]).filter(id => id !== carrierId);
                  onFilterChange("carriers", updatedCarriers);
                } 
                else if (tag.id.startsWith("service-")) {
                  const serviceId = tag.id.replace("service-", "");
                  const updatedServices = (filters.services as string[]).filter(id => id !== serviceId);
                  onFilterChange("services", updatedServices);
                }
                else if (tag.id.startsWith("country-")) {
                  const country = tag.id.replace("country-", "");
                  const updatedCountries = (filters.countries as string[]).filter(c => c !== country);
                  onFilterChange("countries", updatedCountries);
                }
                else if (tag.id.startsWith("market-")) {
                  onFilterChange("sourceCountry", "all");
                }
                else if (tag.id === "weight") {
                  onFilterChange("weight", "1");
                }
                else if (tag.id === "max-price") {
                  onFilterChange("maxPrice", "");
                }
                else if (tag.id === "min-margin") {
                  onFilterChange("minMargin", "");
                }
                else if (tag.id === "volume") {
                  onFilterChange("volume", "100");
                }
                else if (tag.id === "eu-type") {
                  onFilterChange("euType", "all");
                }
                else if (tag.id === "service-type") {
                  onFilterChange("serviceType", "all");
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
            onClick={onFilterReset}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Azzera filtri
          </Button>
        )}
      </div>
    );
  };
  
  // Componente per la selezione multipla di carrier
  const CarrierMultiSelect = () => {
    const selectedCarriers = Array.isArray(filters.carriers) ? filters.carriers.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedCarriers.length === 0 ? (
              <span className="text-muted-foreground">Tutti i corrieri</span>
            ) : (
              <span>{selectedCarriers.length} corrieri selezionati</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Cerca corriere..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Nessun corriere trovato.</CommandEmpty>
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
                        
                        onFilterChange("carriers", updatedSelection);
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
                      onSelect={() => onFilterChange("carriers", [])}
                      className="justify-center text-center"
                    >
                      Deseleziona tutti
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
    const selectedServices = Array.isArray(filters.services) ? filters.services.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    
    // Filtra i servizi in base ai carrier selezionati
    const filteredServices = services.filter(service => {
      if (selectedServices.includes(String(service._id))) return true;
      
      const selectedCarriers = Array.isArray(filters.carriers) ? filters.carriers.map(String) : [];
      if (selectedCarriers.length === 0) return true;
      
      const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier;
      return selectedCarriers.includes(String(carrierId));
    });
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedServices.length === 0 ? (
              <span className="text-muted-foreground">Tutti i servizi</span>
            ) : (
              <span>{selectedServices.length} servizi selezionati</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Cerca servizio..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Nessun servizio trovato.</CommandEmpty>
              <ScrollArea className="h-[200px]">
                <CommandGroup>
                  {filteredServices
                    .filter(service => 
                      service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                      (service.code && service.code.toLowerCase().includes(searchValue.toLowerCase())) ||
                      String(service._id).includes(searchValue)
                    )
                    .map(service => {
                      const carrierId = typeof service.carrier === 'object' ? service.carrier._id : service.carrier;
                      const carrier = carriers.find(c => c._id === carrierId);
                      
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
                            
                            onFilterChange("services", updatedSelection);
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
                              {carrier ? carrier.name : 'Sconosciuto'}
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
                      onSelect={() => onFilterChange("services", [])}
                      className="justify-center text-center"
                    >
                      Deseleziona tutti
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
    const selectedCountries = Array.isArray(filters.countries) ? filters.countries.map(String) : [];
    const [searchValue, setSearchValue] = useState("");
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-10 px-3 py-2 text-sm"
          >
            {selectedCountries.length === 0 ? (
              <span className="text-muted-foreground">Tutti i paesi</span>
            ) : (
              <span>{selectedCountries.length} paesi selezionati</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Cerca paese..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Nessun paese trovato.</CommandEmpty>
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
                          
                          onFilterChange("countries", updatedSelection);
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
                      onSelect={() => onFilterChange("countries", [])}
                      className="justify-center text-center"
                    >
                      Deseleziona tutti
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
            <span>Filtri Salvati</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Salva filtri attuali</div>
            <div className="flex space-x-2">
              <Input 
                placeholder="Nome del set di filtri" 
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
                Salva
              </Button>
            </div>
            
            {savedFilterSets.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="text-sm font-medium mb-2">I tuoi filtri</div>
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
                            <span className="sr-only">Carica filtro</span>
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
            <h3 className="font-medium">Filtri</h3>
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
              <span>Colonne</span>
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
        
        <Accordion
          type="single"
          collapsible
          value={expandedSection}
          onValueChange={setExpandedSection}
          className="w-full"
        >
          {/* Filtri Primari */}
          <AccordionItem value="primary" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center">
                <span className="font-medium">Filtri Primari</span>
                {getActiveFilterCount("primary") > 0 && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                    {getActiveFilterCount("primary")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap items-start gap-3 mt-2">
                {/* Market */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="market" className="text-sm font-medium">
                    Mercato
                  </label>
                  <Select 
                    value={filters.sourceCountry?.toString() || "all"} 
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

                {/* Carrier - Multiselect */}
                <div className="space-y-2 w-[200px]">
                  <label className="text-sm font-medium">
                    Corrieri
                  </label>
                  <CarrierMultiSelect />
                </div>

                {/* Service - Multiselect */}
                <div className="space-y-2 w-[200px]">
                  <label className="text-sm font-medium">
                    Servizi
                  </label>
                  <ServiceMultiSelect />
                </div>

                {/* Country - mostrato solo per spedizioni internazionali - Multiselect */}
                {shouldShowCountryFilter && (
                  <div className="space-y-2 w-[200px]">
                    <label className="text-sm font-medium">
                      Paesi
                    </label>
                    <CountryMultiSelect />
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
                    value={filters.weight?.toString() || "1"}
                    onChange={(e) => onFilterChange("weight", e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Filtri Avanzati */}
          <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center">
                <span className="font-medium">Filtri Avanzati</span>
                {getActiveFilterCount("advanced") > 0 && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                    {getActiveFilterCount("advanced")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap items-start gap-3 mt-2">
                {/* Volume */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="volume" className="text-sm font-medium">
                    Volume Mensile
                  </label>
                  <Input
                    id="volume"
                    type="number"
                    min="1"
                    value={filters.volume?.toString() || "100"}
                    onChange={(e) => onFilterChange("volume", e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Max Price */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="maxPrice" className="text-sm font-medium">
                    Prezzo Max €
                  </label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={filters.maxPrice?.toString() || ""}
                    onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    className="h-10"
                    placeholder="Nessun limite"
                  />
                </div>
                
                {/* Min Margin */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="minMargin" className="text-sm font-medium">
                    Margine Min %
                  </label>
                  <Input
                    id="minMargin"
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minMargin?.toString() || ""}
                    onChange={(e) => onFilterChange("minMargin", e.target.value)}
                    className="h-10"
                    placeholder="Nessun limite"
                  />
                </div>
                
                {/* Service Type */}
                <div className="space-y-2 w-[150px]">
                  <label htmlFor="serviceType" className="text-sm font-medium">
                    Tipo Servizio
                  </label>
                  <Select 
                    value={filters.serviceType?.toString() || "all"} 
                    onValueChange={(value) => onFilterChange("serviceType", value)}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Tutti i tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i tipi</SelectItem>
                      <SelectItem value="normal">Standard</SelectItem>
                      <SelectItem value="pudo">Punto di Ritiro</SelectItem>
                      <SelectItem value="locker">Locker</SelectItem>
                      <SelectItem value="return">Reso</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Filtri Tecnici */}
          <AccordionItem value="technical" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center">
                <span className="font-medium">Filtri Tecnici</span>
                {getActiveFilterCount("technical") > 0 && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5 h-5">
                    {getActiveFilterCount("technical")}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap items-start gap-3 mt-2">
                {/* EU Type - mostrato solo per spedizioni internazionali */}
                {shouldShowCountryFilter && (
                  <div className="space-y-2 w-[150px]">
                    <label htmlFor="euType" className="text-sm font-medium">
                      Regione
                    </label>
                    <Select 
                      value={filters.euType?.toString() || "all"} 
                      onValueChange={(value) => onFilterChange("euType", value)}
                    >
                      <SelectTrigger id="euType">
                        <SelectValue placeholder="Tutte le regioni" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte le regioni</SelectItem>
                        <SelectItem value="eu">Solo EU</SelectItem>
                        <SelectItem value="extra_eu">Solo Extra EU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Fuel Surcharge Toggle */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuel-surcharge-toggle" className="text-sm font-medium">
                      Includi Fuel Surcharge nei prezzi
                    </Label>
                    <Switch
                      checked={includeFuelSurcharge}
                      onCheckedChange={onFuelSurchargeChange}
                      id="fuel-surcharge-toggle"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quando abilitato, il fuel surcharge viene incluso nel calcolo del prezzo finale.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Tag filters */}
        <FilterTags />
      </CardContent>
    </Card>
  );
});

// Aggiungiamo il displayName per il debug
AdvancedRateFilters.displayName = "AdvancedRateFilters";

export default AdvancedRateFilters; 