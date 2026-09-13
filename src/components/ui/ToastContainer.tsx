import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface ToastEventDetail {
  title: string;
  description?: string;
  type?: "success" | "error";
}

interface ToastItem extends ToastEventDetail {
  id: number;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEventDetail>;
      const newToast: ToastItem = {
        id: Date.now(),
        type: "error", // default
        ...customEvent.detail,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener("pixie:toast", handleToast);
    return () => window.removeEventListener("pixie:toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const containerClasses = isSuccess
          ? "border-emerald-200 bg-emerald-50 ring-black/5"
          : "border-rose-200 bg-rose-50 ring-black/5";
        const iconClasses = isSuccess ? "text-emerald-500" : "text-rose-500";
        const titleClasses = isSuccess ? "text-emerald-800" : "text-rose-800";
        const descClasses = isSuccess ? "text-emerald-700" : "text-rose-700";
        const buttonClasses = isSuccess
          ? "bg-emerald-50 text-emerald-500 hover:text-emerald-600 focus:ring-emerald-500"
          : "bg-rose-50 text-rose-500 hover:text-rose-600 focus:ring-rose-500";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm rounded-lg border p-4 shadow-lg ring-1 ${containerClasses}`}
          >
            <div className="shrink-0">
              <AlertCircle className={`h-5 w-5 ${iconClasses}`} aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${titleClasses}`}>{toast.title}</p>
              {toast.description && (
                <p className={`mt-1 text-sm ${descClasses}`}>{toast.description}</p>
              )}
            </div>
            <div className="ml-4 flex shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClasses}`}
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
              >
                <span className="sr-only">Fechar</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
