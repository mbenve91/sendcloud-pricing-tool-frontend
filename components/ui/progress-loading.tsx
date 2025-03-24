import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";

interface ProgressLoadingProps {
  stage: string;
  isComplete?: boolean;
}

const stages = [
  { key: "loading", label: "Caricamento dati..." },
  { key: "carriers", label: "Caricamento corrieri..." },
  { key: "services", label: "Caricamento servizi..." },
  { key: "rates", label: "Caricamento tariffe..." },
  { key: "processing", label: "Elaborazione risultati..." },
  { key: "calculating", label: "Calcolo sconti ottimali..." },
  { key: "finalizing", label: "Finalizzazione dei prezzi..." },
  { key: "complete", label: "Completato!" }
];

const ProgressLoading = ({ stage, isComplete = false }: ProgressLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  
  // Determina il progresso in base allo stato attuale
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      setCurrentStage("Completato!");
      return;
    }
    
    // Trova l'indice dello stage corrente
    const stageIndex = stages.findIndex(s => 
      s.key === stage || s.label.toLowerCase().includes(stage.toLowerCase())
    );
    
    // Se abbiamo trovato lo stage, calcoliamo il progresso 
    if (stageIndex >= 0) {
      setCurrentStage(stages[stageIndex].label);
      
      // Calcola la percentuale considerando che l'ultimo step è "complete"
      const percentage = ((stageIndex + 1) / (stages.length - 1)) * 100;
      
      // Animazione del progresso
      let start = progress;
      let end = Math.min(percentage, 95); // Non raggiunge mai 100% finché non è completo
      
      const animateProgress = () => {
        if (start < end) {
          setProgress(prev => {
            const next = Math.min(prev + 1, end);
            if (next < end) {
              requestAnimationFrame(animateProgress);
            }
            return next;
          });
          start += 1;
        }
      };
      
      requestAnimationFrame(animateProgress);
    }
    
  }, [stage, isComplete, progress]);
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4 space-y-4">
      <div className="w-full max-w-xl space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${!isComplete ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">{currentStage}</span>
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-xs text-muted-foreground mt-2">
          {isComplete 
            ? "Tutti i risultati sono stati elaborati e filtrati in base ai criteri specificati"
            : "Stiamo elaborando la tua richiesta, attendere prego..."}
        </p>
      </div>
    </div>
  );
};

export default ProgressLoading; 