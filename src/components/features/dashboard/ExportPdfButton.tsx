"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
  leadId: string;
  leadName: string;
  hasProposal?: boolean;
  variant?: "proposal" | "report";
}

export function ExportPdfButton({
  leadId,
  hasProposal = false,
  variant = "report",
}: ExportPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleExport(type: "proposal" | "report") {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/leads/${leadId}/export?type=${type}`
      );

      if (!response.ok) {
        throw new Error("Error al generar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type === "proposal" ? "propuesta" : "reporte"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error al exportar PDF");
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "proposal" && hasProposal) {
    return (
      <button
        onClick={() => handleExport("proposal")}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Exportar Propuesta
      </button>
    );
  }

  return (
    <button
      onClick={() => handleExport("report")}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar Reporte
    </button>
  );
}
