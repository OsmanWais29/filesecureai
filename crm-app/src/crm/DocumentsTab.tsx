// Documents tab: pick a client, drop files, upload them to Supabase Storage.
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CloudUpload, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useCRM } from "./store";
import { Empty, SectionTitle } from "./ui";

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"; // allowed file types
const BUCKET = "documents"; // Supabase Storage bucket

// Upload one file + record it in the `documents` table (no-op in demo mode)
async function uploadFile(file: File, clientName: string) {
  if (!supabase) return; // demo mode: pretend it worked
  const path = `${clientName}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  await supabase.from("documents").insert({
    title: file.name,
    type: file.type,
    size: file.size,
    storage_path: path,
    metadata: { client_name: clientName },
  });
}

export const DocumentsTab = () => {
  const { clients, log } = useCRM();
  const [clientId, setClientId] = useState(clients[0]?.id ?? ""); // who the files belong to
  const clientName = clients.find((c) => c.id === clientId)?.name ?? "";
  const [files, setFiles] = useState<File[]>([]); // queued files
  const [done, setDone] = useState<string[]>([]); // names uploaded this session
  const [progress, setProgress] = useState<number | null>(null); // null = not uploading

  // Add files from the picker or a drag & drop
  const addFiles = (list: FileList | null) => list && setFiles((f) => [...f, ...Array.from(list)]);

  // Upload files one by one, updating the progress bar after each
  const upload = async () => {
    setProgress(0);
    let failed = 0;
    for (const [i, file] of files.entries()) {
      try {
        await uploadFile(file, clientName);
        setDone((d) => [`${clientName} · ${file.name}`, ...d]);
      } catch (e) {
        console.error("Upload failed:", e);
        failed++;
      }
      setProgress(((i + 1) / files.length) * 100);
    }
    setProgress(null);
    if (files.length > failed) log(clientId, "note", `${files.length - failed} document(s) uploaded`);
    setFiles([]);
    if (failed) toast.error(`${failed} file(s) failed to upload`);
    else toast.success(supabase ? "Documents uploaded" : "Demo mode: files not stored");
  };

  const uploading = progress !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-5 p-6">
        <SectionTitle icon={CloudUpload}>Upload client documents</SectionTitle>

        {/* Client picker */}
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Choose a client" /></SelectTrigger>
          <SelectContent>
            {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Drop zone (also clickable thanks to the hidden file input) */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <CloudUpload className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium">Drag files here or click to browse</p>
          <p className="text-xs text-muted-foreground">PDF, Word, Excel or images</p>
          <input type="file" multiple accept={ACCEPT} className="hidden" disabled={uploading} onChange={(e) => addFiles(e.target.files)} />
        </label>

        {/* Queued files with a remove button */}
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                <button disabled={uploading} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Progress bar while uploading */}
        {uploading && <Progress value={progress} className="h-2" />}

        <Button className="w-full" disabled={!files.length || !clientName || uploading} onClick={upload}>
          {uploading ? `Uploading… ${Math.round(progress)}%` : `Upload ${files.length || ""} file(s)`}
        </Button>
      </Card>

      {/* Files uploaded during this session */}
      <Card className="p-6">
        <SectionTitle icon={CheckCircle2}>Uploaded</SectionTitle>
        {done.length === 0 && <Empty icon={FileText} text="Nothing uploaded yet" />}
        <ul className="space-y-2">
          {done.map((name, i) => (
            <li key={i} className="flex items-center gap-2 truncate text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{name}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
