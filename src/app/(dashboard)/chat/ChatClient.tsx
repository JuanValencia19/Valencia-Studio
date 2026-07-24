"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@/components/features/dashboard/ChatMessage";
import { ChatInput } from "@/components/features/dashboard/ChatInput";

export function ChatClient() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Chat con IA
        </h1>
        <p className="mt-2 text-neutral-400">
          Consulta leads, analiza métricas y obtén recomendaciones.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <svg
              className="h-12 w-12 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">
              ¿En qué puedo ayudarte?
            </h3>
            <p className="mt-2 max-w-sm text-sm text-neutral-400">
              Puedo consultarte sobre leads, métricas del pipeline, o sugerirte
              estrategias de outreach.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setInput("¿Cuáles son mis mejores leads?");
                }}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                ¿Cuáles son mis mejores leads?
              </button>
              <button
                onClick={() => {
                  setInput("Muéstrame las métricas del pipeline");
                }}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                Muéstrame las métricas
              </button>
              <button
                onClick={() => {
                  setInput("¿Qué leads necesitan atención urgente?");
                }}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                Leads urgentes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          Error: {error.message}
        </div>
      )}

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
