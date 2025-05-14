"use client";

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";
import CommercialChat from "@/components/chat/CommercialChat";

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState("commerciale");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Assistente AI Sendcloud</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commerciale">Assistente Commerciale</TabsTrigger>
          <TabsTrigger value="supporto">Supporto Clienti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="commerciale" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assistente Commerciale
              </CardTitle>
              <CardDescription>
                Genera offerte personalizzate per i tuoi clienti basate su volume, destinazioni e altre caratteristiche.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Inizia una conversazione</h3>
                  <p className="text-sm text-muted-foreground">
                    Descrivi il cliente per cui vuoi creare un'offerta. Includi:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                    <li>Volume mensile di spedizioni</li>
                    <li>Destinazioni principali</li>
                    <li>Tipo di prodotti e pesi</li>
                    <li>Eventuali requisiti specifici</li>
                  </ul>
                  <Button className="mt-2" onClick={() => {
                    const chat = document.getElementById('fixed-chat-container');
                    if (chat) {
                      const button = chat.querySelector('button');
                      button?.click();
                    }
                  }}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Apri Chat Assistente
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Funzionalità</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-sm">Suggerimenti tariffe ottimali per ogni destinazione</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-sm">Calcolo sconti personalizzati basati sul volume</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-sm">Verifica automatica dei margini e limiti di sconto</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-sm">Comparazione tra diverse opzioni di spedizione</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Le offerte generate sono indicative e soggette a verifica prima della finalizzazione.
                Gli sconti massimi applicabili sono limitati al 90% del margine di ciascuna tariffa.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="supporto" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Supporto Clienti
              </CardTitle>
              <CardDescription>
                Ottieni assistenza sui servizi Sendcloud e risposte alle tue domande.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-600 italic">
                Questa funzionalità sarà disponibile prossimamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div id="fixed-chat-container" className="fixed bottom-6 right-6">
        <CommercialChat />
      </div>
    </div>
  );
} 