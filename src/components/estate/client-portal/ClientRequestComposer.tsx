import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClientRequest } from "@/data/clientPortal/store";
import {
  ClientPriority,
  ClientRequestType,
  REQUEST_TYPE_LABELS,
} from "@/data/clientPortal/types";

const PRIORITIES: ClientPriority[] = ["Standard", "Important", "Time sensitive"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName?: string;
  defaults?: Partial<{
    requestType: ClientRequestType;
    title: string;
    description: string;
    requestedDocumentType: string;
    sourceSignalId: string;
    sourceDocumentId: string;
  }>;
}

/** Trustee-side composer that turns an internal need into a client-facing request. */
export const ClientRequestComposer = ({ open, onOpenChange, staffName = "Trustee staff", defaults }: Props) => {
  const [requestType, setRequestType] = useState<ClientRequestType>(defaults?.requestType ?? "upload_document");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [requirement, setRequirement] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<ClientPriority>("Standard");
  const [docType, setDocType] = useState(defaults?.requestedDocumentType ?? "");
  const [staffNote, setStaffNote] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setRequirement("");
    setDueDate("");
    setPriority("Standard");
    setDocType("");
    setStaffNote("");
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("A client-facing title is required.");
      return;
    }
    createClientRequest({
      title: title.trim(),
      description: [description.trim(), requirement.trim() && `What is required: ${requirement.trim()}`]
        .filter(Boolean)
        .join("\n\n"),
      requestType,
      requestedDocumentType: docType || undefined,
      sourceSignalId: defaults?.sourceSignalId,
      sourceDocumentId: defaults?.sourceDocumentId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      requestedByUserId: "staff-current",
      requestedByName: staffName,
      staffNotes: staffNote || undefined,
    });
    toast.success("Request sent to the client portal.");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request from client</DialogTitle>
          <DialogDescription>
            The client sees the title, plain-language message and due date only. Internal notes stay on the estate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Request type</Label>
            <Select value={requestType} onValueChange={(v) => setRequestType(v as ClientRequestType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as ClientPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Client-facing title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Upload your latest pay statement" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Plain-language message</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what you need in everyday language."
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>What is required</Label>
            <Input value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="All pages, clearly readable" />
          </div>
          <div className="space-y-1.5">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Requested document type</Label>
            <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="Pay statement" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Internal staff note (never shown to the client)</Label>
            <Textarea rows={2} value={staffNote} onChange={(e) => setStaffNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
