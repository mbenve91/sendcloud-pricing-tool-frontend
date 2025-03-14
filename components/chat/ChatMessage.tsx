"use client";

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  carrierName?: string;
  carrierLogo?: string;
}

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  isUser,
  carrierName,
  carrierLogo
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarFallback className="bg-primary text-white">
              <User size={18} />
            </AvatarFallback>
          </>
        ) : (
          <>
            {carrierLogo ? (
              <AvatarImage src={carrierLogo} alt={carrierName || "AI"} />
            ) : null}
            <AvatarFallback className="bg-secondary">
              <Bot size={18} />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={cn(
          "flex-1 p-4 rounded-lg shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <Markdown>{message}</Markdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage; 