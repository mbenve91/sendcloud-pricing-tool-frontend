"use client";

import { FC, useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import CarrierSelector from './CarrierSelector';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export interface Carrier {
  _id: string;
  name: string;
  logoUrl: string | null;
}

export interface ChatWidgetProps {
  carrier?: Carrier;
}

const ChatWidget: FC<ChatWidgetProps> = ({ carrier: initialCarrier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(initialCarrier || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when carrier changes
  useEffect(() => {
    if (selectedCarrier) {
      setMessages([
        {
          id: Date.now().toString(),
          text: `Hi there! I'm your AI assistant for ${selectedCarrier.name}. How can I help you today?`,
          isUser: false,
        },
      ]);
    }
  }, [selectedCarrier]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedCarrier) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          carrierId: selectedCarrier._id,
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
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I couldn't process your request. Please try again later.",
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, something went wrong. Please try again later.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const handleCarrierSelect = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mb-4 w-[380px] bg-card rounded-lg shadow-lg flex flex-col h-[500px] overflow-hidden border"
          >
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {selectedCarrier?.logoUrl ? (
                    <img src={selectedCarrier.logoUrl} alt={selectedCarrier.name} className="h-full w-full object-contain" />
                  ) : (
                    <AvatarFallback className="bg-secondary">
                      <Bot size={18} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold">AI Assistant</h3>
                  {selectedCarrier && (
                    <Badge variant="outline" className="text-xs">
                      {selectedCarrier.name}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </Button>
            </div>
            
            <div className="p-3 border-b">
              <CarrierSelector 
                onSelect={handleCarrierSelect} 
                selectedCarrierId={selectedCarrier?._id}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-muted/30">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.text}
                    isUser={msg.isUser}
                    carrierName={selectedCarrier?.name}
                    carrierLogo={selectedCarrier?.logoUrl || undefined}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t bg-card">
              <div className="flex gap-2">
                <Textarea
                  className="min-h-[40px] max-h-[120px] resize-none"
                  placeholder="Ask a question about this carrier..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !selectedCarrier}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={!message.trim() || isLoading || !selectedCarrier}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
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
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
};

export default ChatWidget; 