import { useState, useEffect } from 'react';
import { FilterValue, SavedFilterSet } from '@/components/advanced-rate-filters';

const FILTER_STORAGE_KEY = 'sendquote-saved-filters';
const DEFAULT_FILTER_KEY = 'sendquote-default-filter';

export function useFilterPersistence() {
  // State per i set di filtri salvati
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>([]);
  
  // Carica i filtri salvati da localStorage all'inizializzazione
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilters) {
        setSavedFilterSets(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.error('Errore nel caricamento dei filtri salvati:', error);
    }
  }, []);
  
  // Funzione per salvare un nuovo set di filtri
  const saveFilterSet = (name: string, values: FilterValue) => {
    const newFilterSet: SavedFilterSet = {
      id: `filter-${Date.now()}`,
      name,
      values,
      isDefault: false
    };
    
    setSavedFilterSets(prev => {
      const updated = [...prev, newFilterSet];
      
      // Salva nel localStorage
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Errore nel salvataggio dei filtri:', error);
      }
      
      return updated;
    });
    
    return newFilterSet.id;
  };
  
  // Funzione per impostare un filtro come predefinito
  const setDefaultFilterSet = (filterId: string) => {
    setSavedFilterSets(prev => {
      const updated = prev.map(filter => ({
        ...filter,
        isDefault: filter.id === filterId
      }));
      
      // Salva nel localStorage
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
        
        // Salva l'ID del filtro predefinito separatamente per un recupero più veloce
        const defaultFilter = updated.find(f => f.isDefault);
        if (defaultFilter) {
          localStorage.setItem(DEFAULT_FILTER_KEY, defaultFilter.id);
        } else {
          localStorage.removeItem(DEFAULT_FILTER_KEY);
        }
      } catch (error) {
        console.error('Errore nell\'impostazione del filtro predefinito:', error);
      }
      
      return updated;
    });
  };
  
  // Funzione per eliminare un set di filtri
  const deleteFilterSet = (filterId: string) => {
    setSavedFilterSets(prev => {
      const updated = prev.filter(filter => filter.id !== filterId);
      
      // Aggiorna localStorage
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(updated));
        
        // Se stiamo eliminando il filtro predefinito, rimuovi anche il riferimento
        const defaultFilterId = localStorage.getItem(DEFAULT_FILTER_KEY);
        if (defaultFilterId === filterId) {
          localStorage.removeItem(DEFAULT_FILTER_KEY);
        }
      } catch (error) {
        console.error('Errore nella eliminazione del filtro:', error);
      }
      
      return updated;
    });
  };
  
  // Funzione per ottenere il filtro predefinito
  const getDefaultFilterSet = (): SavedFilterSet | undefined => {
    return savedFilterSets.find(filter => filter.isDefault);
  };
  
  // Funzione per ottenere i valori di un filtro specifico
  const getFilterValues = (filterId: string): FilterValue | undefined => {
    const filter = savedFilterSets.find(f => f.id === filterId);
    return filter?.values;
  };
  
  return {
    savedFilterSets,
    saveFilterSet,
    setDefaultFilterSet,
    deleteFilterSet,
    getDefaultFilterSet,
    getFilterValues
  };
}

export default useFilterPersistence; 