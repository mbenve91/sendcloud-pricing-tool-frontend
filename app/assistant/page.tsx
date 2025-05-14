"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Search, FileText, Trash2, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatMessage from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
}

export default function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carica conversazioni di esempio
  useEffect(() => {
    const exampleConversations: Conversation[] = [
      {
        id: '1',
        title: 'Cliente spedizioni Italia e USA',
        updatedAt: '2025-05-14T09:16:38',
        preview: 'Ho bisogno di una offerta per un cliente che spedisce 200 pacchi al mese in Italia...'
      },
      {
        id: '2',
        title: 'Cliente e-commerce abbigliamento',
        updatedAt: '2025-05-13T15:30:00',
        preview: 'Cliente che spedisce abbigliamento, volumi alti, spedizioni nazionali'
      },
      {
        id: '3',
        title: 'Spedizioni Germania e Francia',
        updatedAt: '2025-05-12T10:45:22',
        preview: 'Cliente con 80 spedizioni verso Germania e Francia, peso medio 2kg'
      }
    ];
    
    setConversations(exampleConversations);
  }, []);

  // Aggiunge un messaggio di benvenuto quando non c'è una conversazione selezionata
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([
        {
          id: '0',
          text: "Benvenuto all'assistente commerciale Sendcloud! Seleziona una conversazione esistente o iniziane una nuova per generare offerte personalizzate per i tuoi clienti.",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } else {
      // In un'app reale, qui caricheremmo i messaggi della conversazione dal database
      // Per esempio, mediante una fetch a /api/assistant/conversation/[id]
    }
  }, [selectedConversation]);

  const handleStartNewConversation = () => {
    // In un'app reale, qui creeremmo una nuova conversazione nel database
    const newConversationId = (conversations.length + 1).toString();
    const newConversation: Conversation = {
      id: newConversationId,
      title: 'Nuova conversazione',
      updatedAt: new Date().toISOString(),
      preview: 'Nuova conversazione iniziata...'
    };
    
    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversationId);
    setMessages([
      {
        id: Date.now().toString(),
        text: "Benvenuto! Descrivi il cliente per cui vuoi generare un'offerta, indicando volume mensile, destinazioni principali, tipo di prodotti e pesi.",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Simula una risposta API (in un'app reale, qui chiameremmo l'API dell'assistente)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Grazie per le informazioni. Sto elaborando un'offerta per il tuo cliente che spedisce 200 pacchi al mese in Italia e 20 negli Stati Uniti. Posso chiederti quale sia il peso medio dei pacchi per calcolare la tariffa più adatta?",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Aggiorna anche la preview nella lista conversazioni
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? {...conv, preview: inputMessage, title: inputMessage.substring(0, 30) + '...'}
            : conv
        ));
      }, 1500);
      
      // Implementazione reale commentata
      /*
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          conversationId: selectedConversation === 'new' ? null : selectedConversation
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Se è una nuova conversazione, aggiorna l'ID
        if (selectedConversation === 'new') {
          setSelectedConversation(data.data.conversationId);
          
          // Aggiungi la nuova conversazione alla lista
          const newConversation: Conversation = {
            id: data.data.conversationId,
            title: inputMessage.substring(0, 30) + '...',
            updatedAt: new Date().toISOString(),
            preview: inputMessage
          };
          
          setConversations([newConversation, ...conversations]);
        } else {
          // Aggiorna la preview nella lista conversazioni
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation 
              ? {...conv, preview: inputMessage, updatedAt: new Date().toISOString()}
              : conv
          ));
        }
      } else {
        // Gestione errore
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Mi dispiace, c'è stato un errore nell'elaborazione della tua richiesta.",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      */
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Mi dispiace, si è verificato un errore di connessione. Riprova più tardi.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-card border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Conversazioni</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca conversazioni"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="p-2">
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleStartNewConversation}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuova conversazione
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedConversation === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm line-clamp-1">{conv.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{conv.preview}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat principale */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-card flex justify-between items-center">
          <div className="flex items-center">
            {selectedConversation ? (
              <>
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.title.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {conversations.find(c => c.id === selectedConversation)?.title || 'Conversazione'}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Assistente commerciale Sendcloud
                  </span>
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-secondary">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Assistente commerciale</h3>
                  <span className="text-xs text-muted-foreground">
                    Seleziona o inizia una conversazione
                  </span>
                </div>
              </>
            )}
          </div>
          
          {selectedConversation && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" title="Esporta offerta">
                <FileText size={18} />
              </Button>
              <Button variant="ghost" size="icon" title="Elimina conversazione">
                <Trash2 size={18} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Area messaggi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg.text}
              isUser={msg.isUser}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              placeholder={selectedConversation ? "Scrivi un messaggio..." : "Seleziona una conversazione per iniziare"}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedConversation || isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!selectedConversation || !inputMessage.trim() || isLoading}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Invia
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 