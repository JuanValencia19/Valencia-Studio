"use client";

import type { UIMessage } from "ai";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-violet-600 text-white"
            : "bg-neutral-800 text-neutral-200"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">
              AI
            </div>
          )}
          <div className="flex-1">
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
                    {part.text}
                  </p>
                );
              }
              if (part.type.startsWith("tool-")) {
                const toolPart = part as { type: string; toolCallId: string; state: string; toolName?: string; result?: unknown };
                const resultStr = toolPart.state === "result" && toolPart.result
                  ? (typeof toolPart.result === "string"
                      ? toolPart.result
                      : JSON.stringify(toolPart.result, null, 2))
                  : null;
                return (
                  <div
                    key={index}
                    className="mt-2 rounded-lg bg-neutral-900/50 p-2 text-xs"
                  >
                    <span className="font-medium text-violet-400">
                      {toolPart.toolName || "Tool"}
                    </span>
                    {resultStr && (
                      <pre className="mt-1 max-h-32 overflow-auto text-neutral-400">
                        {resultStr}
                      </pre>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
          {isUser && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              T
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
