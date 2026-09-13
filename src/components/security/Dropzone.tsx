import { FileKey2, Upload } from "lucide-react";
import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DropzoneProps {
  label: string;
  hint: string;
  filled: boolean;
  filename: string | null;
  onDrop: (name: string, file: File | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dropzone({
  label,
  hint,
  filled,
  filename,
  onDrop,
}: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          onDrop(file.name, file);
        }
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-6 text-center transition-colors sm:px-4 sm:py-7 ${
        drag
          ? "border-emerald-400 bg-emerald-50"
          : filled
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-stone-200 bg-stone-50 hover:border-stone-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onDrop(file.name, file);
          }
        }}
      />
      {filled ? (
        <>
          <FileKey2 className="h-5 w-5 text-emerald-600" />
          <div className="font-mono text-[12px] text-emerald-700">
            {filename}
          </div>
          <div className="text-[11px] text-emerald-600">
            carregado · clique para substituir
          </div>
        </>
      ) : (
        <>
          <Upload className="h-5 w-5 text-stone-400" />
          <div className="text-[13px] font-medium text-stone-600">{label}</div>
          <div className="text-[11px] text-stone-400">{hint}</div>
        </>
      )}
    </div>
  );
}
