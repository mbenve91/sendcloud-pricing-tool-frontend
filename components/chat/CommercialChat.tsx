"use client";

import { FC, useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, X, MessageSquare, Loader2, FileText, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from "@/components/ui/card";
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface Offer {
  id: string;
  suggestedServices: Array<{
    carrier: string;
    service: string;
    originalPrice: number;
    discountPercentage: number;
    discountedPrice: number;
    deliveryTimeMin: number;
    deliveryTimeMax: number;
  }>;
  totalSavings: number;
  minimumVolume: number;
}

interface CommercialChatProps {
  className?: string;
}

const CommercialChat: FC<CommercialChatProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('initial');
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mostra messaggio di benvenuto all'avvio
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          text: "Benvenuto all'assistente commerciale Sendcloud! Sono qui per aiutarti a creare offerte personalizzate per i tuoi clienti. Descrivi il cliente per cui vuoi generare un'offerta, indicando volume mensile, tipo di prodotto, fasce di peso e destinazioni.",
          isUser: false,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setConversationId(data.data.conversationId);
        setCurrentStage(data.data.stage);

        // Se è stata generata un'offerta, la recuperiamo
        if (data.data.suggestedOfferId) {
          fetchOfferDetails(data.data.suggestedOfferId);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Mi dispiace, non sono riuscito a elaborare la richiesta. Riprova più tardi.",
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfferDetails = async (offerId: string) => {
    try {
      const response = await fetch(`/api/assistant/offer/${offerId}`);
      const data = await response.json();
      
      if (data.success) {
        const offer = data.data.offer;
        setCurrentOffer({
          id: offer._id,
          suggestedServices: offer.offer.suggestedServices.map((service: any) => ({
            carrier: service.carrier.name,
            service: service.service.name,
            originalPrice: service.originalPrice,
            discountPercentage: service.discountPercentage,
            discountedPrice: service.discountedPrice,
            deliveryTimeMin: service.service.deliveryTimeMin,
            deliveryTimeMax: service.service.deliveryTimeMax
          })),
          totalSavings: offer.offer.totalSavings,
          minimumVolume: offer.offer.minimumVolume
        });
      }
    } catch (error) {
      console.error('Error fetching offer details:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mb-4 w-[500px] bg-card rounded-lg shadow-lg flex flex-col h-[600px] overflow-hidden border"
          >
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    <Bot size={18} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold">Assistente Commerciale</h3>
                  <Badge variant="outline" className="text-xs">
                    {currentStage === 'data_collection' && 'Raccolta Dati'}
                    {currentStage === 'offer_generation' && 'Generazione Offerta'}
                    {currentStage === 'feedback' && 'Valutazione Offerta'}
                    {currentStage === 'completed' && 'Offerta Accettata'}
                    {currentStage === 'initial' && 'Iniziale'}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-muted/30">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg.text}
                      isUser={msg.isUser}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
              
              {currentOffer && currentStage === 'feedback' && (
                <div className="p-3 border-t bg-muted/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span className="text-sm font-medium">Offerta Generata</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowOfferDetails(!showOfferDetails)}
                    >
                      <ChevronRight 
                        size={16} 
                        className={`transition-transform ${showOfferDetails ? 'rotate-90' : ''}`} 
                      />
                    </Button>
                  </div>
                  
                  {showOfferDetails && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-2"
                      >
                        {currentOffer.suggestedServices.map((service, index) => (
                          <Card key={index} className="p-2 text-xs">
                            <div className="font-semibold">{service.carrier} - {service.service}</div>
                            <div className="mt-1 flex justify-between">
                              <span>Prezzo originale: €{service.originalPrice.toFixed(2)}</span>
                              <span>Sconto: {service.discountPercentage}%</span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span>Prezzo scontato: <strong>€{service.discountedPrice.toFixed(2)}</strong></span>
                              <span>Consegna: {service.deliveryTimeMin}-{service.deliveryTimeMax} giorni</span>
                            </div>
                          </Card>
                        ))}
                        <div className="text-xs flex justify-between mt-2">
                          <span>Volume minimo: <strong>{currentOffer.minimumVolume} spedizioni/mese</strong></span>
                          <span>Risparmio totale: <strong>€{currentOffer.totalSavings.toFixed(2)}</strong></span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}
              
              <div className="p-3 border-t bg-card">
                <div className="flex gap-2">
                  <Textarea
                    className="min-h-[40px] max-h-[120px] resize-none"
                    placeholder="Descrivi il cliente o fai domande sull'offerta..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={!message.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <FileText size={24} />
      </motion.button>
    </div>
  );
};

export default CommercialChat; 