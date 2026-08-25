import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClientRequest } from "@/data/clientPortal/types";
import { addClientDocument } from "@/data/clientPortal/store";
import { FileUp, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Upload surface for a document request. Files are registered against the
 * request so the trustee sees exactly what satisfied which ask.
 */
export const DocumentRequestUploader = ({
  request,
  onUploaded,
}: {
  request: ClientRequest;
  onUploaded: (documentIds: string[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const ids: string[] = [];
    const names: string[] = [];
    for (const file of Array.from(files)) {
      const doc = addClientDocument({
        title: file.name,
        category: request.requestType === "provide_bank_statement" ? "Bank statement" : "Requested document",
        source: "client_upload",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "You",
        sizeBytes: file.size,
        state: "Under review",
        linkedRequestId: request.id,
      });
      ids.push(doc.id);
      names.push(file.name);
    }
    setDone((p) => [...p, ...names]);
    onUploaded(ids);
    setBusy(false);
    toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} attached`);
  };

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 px-4 py-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <FileUp className="mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drag a file here, or choose from your device</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG. Photos of paper documents are fine.</p>
        <Button variant="outline" className="mt-3 h-11" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {done.length > 0 && (
        <ul className="space-y-1 text-sm">
          {done.map((n) => (
            <li key={n} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-accent" />
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
