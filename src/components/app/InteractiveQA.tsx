"use client";

import type { Message } from "@/lib/types";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizonal, Bot, User } from "lucide-react";
import { askQuestionAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function InteractiveQA({ subjectName }: { subjectName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append('question', input);
    formData.append('subject', subjectName);

    const result = await askQuestionAction(formData);

    if (result.data?.answer) {
      const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: result.data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } else if (result.error) {
      const errorMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: `Désolé, une erreur est survenue: ${result.error}` };
      setMessages((prev) => [...prev, errorMessage]);
       toast({
        variant: "destructive",
        title: "Erreur",
        description: result.error,
      });
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTo({ top: scrollAreaViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Questions & Réponses</CardTitle>
        <CardDescription>Pose n'importe quelle question sur {subjectName} et je t'aiderai.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%]">
                    <p className="text-sm">Bonjour ! Pose-moi une question sur le cours de {subjectName}. Par exemple: "Explique-moi le bilan comptable".</p>
                </div>
            </div>
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-start gap-3", m.role === 'user' && 'justify-end')}>
                {m.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback><Bot size={18}/></AvatarFallback>
                    </Avatar>
                )}
                <div className={cn("p-3 rounded-lg max-w-[80%]", m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-tl-none')}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
                 {m.role === 'user' && (
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback><User size={18}/></AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot size={18}/></AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Pose ta question ici..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
