import { useState, useEffect } from 'react';

/**
 * Hook personalizzato per gestire i filtri di ricerca con persistenza
 * nel localStorage per mantenere le preferenze dell'utente tra le sessioni.
 * 
 * @param storageKey - La chiave utilizzata per salvare i filtri nel localStorage
 * @param defaultFilters - I filtri predefiniti da utilizzare se non ci sono filtri salvati
 * @returns Un array con i filtri correnti e una funzione per aggiornarli
 */
export function usePersistentFilters<T>(storageKey: string, defaultFilters: T) {
  // Inizializza lo state con i filtri dal localStorage o con i filtri predefiniti
  const [filters, setFilters] = useState<T>(() => {
    // Tenta di recuperare filtri salvati dal localStorage
    const savedFilters = localStorage.getItem(storageKey);
    
    // Se ci sono filtri salvati, analizzali e restituiscili
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as T;
        return parsedFilters;
      } catch (error) {
        // In caso di errore durante il parsing, usa i filtri predefiniti
        console.error('Errore nel parsing dei filtri salvati:', error);
        return defaultFilters;
      }
    }
    
    // Se non ci sono filtri salvati, usa i filtri predefiniti
    return defaultFilters;
  });

  // Aggiorna il localStorage quando i filtri cambiano
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, storageKey]);

  // Funzione per aggiornare i filtri con gestione di tipi più affidabile
  const updateFilters = (newFilters: Partial<T> | ((prevFilters: T) => T)) => {
    if (typeof newFilters === 'function') {
      // Se è una funzione callback, usala direttamente
      setFilters(newFilters);
    } else {
      // Se è un oggetto parziale, uniscilo ai filtri esistenti
      setFilters(prevFilters => ({
        ...prevFilters,
        ...newFilters
      }));
    }
  };

  // Restituisci filtri correnti e funzione di aggiornamento
  return [filters, updateFilters] as const;
}

/**
 * Versione specializzata dell'hook usePersistentFilters per i filtri delle tariffe
 * Include la tipizzazione specifica e i valori predefiniti per i filtri delle tariffe
 */
export interface RateFilters {
  sourceCountry: string;
  carriers: string[];
  services: string[];
  countries: string[];
  weight: string;
  volume: string;
  maxPrice: string;
  minMargin: string;
  euType: string;
  serviceType: string;
  sort?: {
    key: string;
    direction: 'ascending' | 'descending';
  };
  [key: string]: string | string[] | number | number[] | boolean | {
    key: string;
    direction: 'ascending' | 'descending';
  } | undefined;
}

// Filtri predefiniti per le tariffe
const DEFAULT_RATE_FILTERS: RateFilters = {
  sourceCountry: "all",
  carriers: [],
  services: [],
  countries: [],
  weight: "1",
  volume: "100",
  maxPrice: "",
  minMargin: "",
  euType: "all",
  serviceType: "all",
  sort: {
    key: "finalPrice",
    direction: "ascending"
  }
};

/**
 * Hook per gestire i filtri di ricerca delle tariffe con persistenza
 * @returns Un array con i filtri correnti e una funzione per aggiornarli
 */
export function useRateFilters() {
  return usePersistentFilters<RateFilters>('rate-filters', DEFAULT_RATE_FILTERS);
}

export default useRateFilters; 