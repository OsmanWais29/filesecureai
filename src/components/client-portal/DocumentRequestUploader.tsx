import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClientRequest } from "@/data/clientPortal/types";
import { usePortalSession } from "@/data/clientPortal/session";
import { uploadPortalDocument } from "@/data/clientPortal/db";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = [".pdf", ".png", ".jpg", ".jpeg", ".heic", ".webp"];

/**
 * Real upload surface for a document request. Files go to private storage under
 * the estate prefix and are recorded against the request, so the trustee sees
 * exactly what satisfied which ask. Multiple files per request are supported.
 */
export const DocumentRequestUploader = ({
  request,
  onUploaded,
}: {
  request: ClientRequest;
  onUploaded?: (documentIds: string[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { session } = usePortalSession();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);

  const category =
    request.requestType === "provide_bank_statement" ? "Bank statement" : request.requestedDocumentType || "Requested document";

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!session) {
      toast.error("Your session is not connected to a file yet.");
      return;
    }
    setBusy(true);
    const ids: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setFailed((p) => [...p, `${file.name} — larger than 25 MB`]);
        continue;
      }
      try {
        const doc = await uploadPortalDocument({
          estateId: session.estateId,
          file,
          actor: { userId: session.userId, name: session.name },
          requestId: request.id,
          category,
        });
        ids.push(doc.id);
        setDone((p) => [...p, file.name]);
      } catch (e) {
        setFailed((p) => [...p, `${file.name} — ${(e as Error).message}`]);
      }
    }

    setBusy(false);
    qc.invalidateQueries({ queryKey: ["portal-documents", session.estateId] });
    if (ids.length) {
      onUploaded?.(ids);
      toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} sent to your trustee`);
    }
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
        <p className="text-sm font-medium">Drag files here, or choose from your device</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, JPG, PNG or HEIC, up to 25 MB each. Photos of paper documents are fine, and you can add more than one.
        </p>
        <Button variant="outline" className="mt-3 h-11" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? "Uploading…" : "Choose files"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
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

      {failed.length > 0 && (
        <ul className="space-y-1 text-sm">
          {failed.map((n) => (
            <li key={n} className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
