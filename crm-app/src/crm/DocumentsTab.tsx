// Documents: pick a client, drop files, upload them straight to S3 (via the backend's
// presigned links), and see/download what's already on file.
import { useEffect, useState } from "react";
import { CloudUpload, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type DocRow } from "./api";
import { useCRM } from "./store";
import { daysAgo } from "./data";
import { Empty, FileDrop, Panel, SelectField } from "./ui";

export const DocumentsTab = () => {
  const { clients, byId, uploadDocuments } = useCRM();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const name = byId.get(clientId)?.name ?? "";

  // Load the chosen client's files
  const load = () => { if (clientId) api.documents(clientId).then(setDocs).catch(() => setDocs([])); };
  useEffect(load, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Upload, then refresh the list
  const upload = async () => {
    setBusy(true);
    await uploadDocuments(clientId, files);
    setBusy(false);
    setFiles([]);
    load();
  };

  // Open a short-lived download link in a new tab
  const open = async (id: string) => window.open((await api.downloadUrl(id)).url, "_blank");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Panel icon={CloudUpload} title="Upload client documents">
        <div className="space-y-4">
          <SelectField id="doc-client" label="Client" placeholder="Choose a client" value={clientId} onChange={setClientId} options={clients.map((c) => c.id)} show={(id) => byId.get(id)?.name ?? id} />
          <FileDrop files={files} setFiles={setFiles} disabled={busy} />
          <Button className="w-full" disabled={!files.length || !name || busy} onClick={upload}>
            {busy ? "Uploading…" : `Upload ${files.length || ""} file(s)`}
          </Button>
        </div>
      </Panel>

      <Panel icon={FileText} title={name ? `On file for ${name}` : "On file"}>
        {!docs.length && <Empty icon={FileText} text="No documents yet" />}
        {docs.map((d) => (
          <div key={d.id} className="mb-2 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="text-xs text-muted-foreground">{d.status === "uploaded" ? (daysAgo(d.createdAt) ? `${daysAgo(d.createdAt)}d ago` : "today") : "pending"}</span>
            <Button size="icon" variant="ghost" className="h-7 w-7" disabled={d.status !== "uploaded"} onClick={() => open(d.id)} aria-label={`Download ${d.name}`}><Download className="h-4 w-4" /></Button>
          </div>
        ))}
      </Panel>
    </div>
  );
};
