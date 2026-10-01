// Documents: pick a client, drop files, upload them (Supabase Storage, or demo mode).
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CloudUpload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useCRM } from "./store";
import { Empty, FileDrop, Panel, SelectField } from "./ui";

// Upload one file and record it in the `documents` table (no-op in demo mode)
async function uploadFile(file: File, clientId: string, clientName: string) {
  if (!supabase) return;
  const path = `${clientId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("documents").upload(path, file);
  if (error) throw error;
  await supabase.from("documents").insert({ title: file.name, type: file.type, size: file.size, storage_path: path, metadata: { client_id: clientId, client_name: clientName } });
}

export const DocumentsTab = () => {
  const { clients, byId, log } = useCRM();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [done, setDone] = useState<string[]>([]); // uploaded this session
  const [progress, setProgress] = useState<number | null>(null); // null = idle
  const name = byId.get(clientId)?.name ?? "";

  // Upload all files in parallel; progress counts finished files
  const upload = async () => {
    let finished = 0;
    setProgress(0);
    const results = await Promise.allSettled(files.map((f) =>
      uploadFile(f, clientId, name).finally(() => setProgress((++finished / files.length) * 100))));
    const ok = files.filter((_, i) => results[i].status === "fulfilled");
    setDone((d) => [...ok.map((f) => `${name} · ${f.name}`), ...d]);
    if (ok.length) log(clientId, "note", `${ok.length} document(s) uploaded`);
    const failed = files.length - ok.length;
    failed ? toast.error(`${failed} file(s) failed to upload`) : toast.success(supabase ? "Documents uploaded" : "Demo mode: files not stored");
    setProgress(null);
    setFiles([]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Panel icon={CloudUpload} title="Upload client documents">
        <div className="space-y-4">
          <SelectField id="doc-client" label="Client" placeholder="Choose a client" value={clientId} onChange={setClientId} options={clients.map((c) => c.id)} show={(id) => byId.get(id)!.name} />
          <FileDrop files={files} setFiles={setFiles} disabled={progress !== null} />
          {progress !== null && <Progress value={progress} className="h-2" />}
          <Button className="w-full" disabled={!files.length || !name || progress !== null} onClick={upload}>
            {progress !== null ? `Uploading… ${Math.round(progress)}%` : `Upload ${files.length || ""} file(s)`}
          </Button>
        </div>
      </Panel>

      <Panel icon={CheckCircle2} title="Uploaded">
        {!done.length && <Empty icon={FileText} text="Nothing uploaded yet" />}
        {done.map((n, i) => <p key={i} className="mb-2 flex items-center gap-2 truncate text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{n}</p>)}
      </Panel>
    </div>
  );
};
