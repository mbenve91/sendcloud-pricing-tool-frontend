"use client";

import { FC } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TypingIndicator: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 p-4 rounded-lg"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-secondary">
          <Bot size={18} />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 p-4 rounded-lg bg-muted h-12 flex items-center">
        <div className="flex space-x-2">
          <motion.div
            className="h-3 w-3 rounded-full bg-muted-foreground"
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-3 w-3 rounded-full bg-muted-foreground"
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: 0.2,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-3 w-3 rounded-full bg-muted-foreground"
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: 0.4,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator; 