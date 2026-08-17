import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "time"
  | "select"
  | "checkbox"
  | "textarea";

export interface FieldSpec {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  /** Provenance / source note rendered beside the field. */
  provenance?: string;
  span?: 1 | 2 | 3;
  readOnly?: boolean;
  hint?: string;
}

export interface SectionSpec {
  title: string;
  description?: string;
  fields: FieldSpec[];
}

export type RecordValues = Record<string, string | number | boolean | undefined>;

interface FieldProps {
  field: FieldSpec;
  value: RecordValues[string];
  onChange: (key: string, value: string | boolean) => void;
}

const FieldControl = ({ field, value, onChange }: FieldProps) => {
  const common = {
    id: field.key,
    disabled: field.readOnly,
  };

  if (field.type === "checkbox") {
    return (
      <div className="flex h-10 items-center gap-2">
        <Checkbox
          id={field.key}
          checked={Boolean(value)}
          disabled={field.readOnly}
          onCheckedChange={(v) => onChange(field.key, Boolean(v))}
        />
        <Label htmlFor={field.key} className="text-sm font-normal">
          {field.label}
        </Label>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <Select
        value={value ? String(value) : undefined}
        disabled={field.readOnly}
        onValueChange={(v) => onChange(field.key, v)}
      >
        <SelectTrigger id={field.key}>
          <SelectValue placeholder={field.placeholder ?? "Select…"} />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {(field.options ?? []).map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        {...common}
        rows={3}
        placeholder={field.placeholder}
        value={value ? String(value) : ""}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    );
  }

  const inputType =
    field.type === "date"
      ? "date"
      : field.type === "time"
        ? "time"
        : field.type === "number" || field.type === "money"
          ? "number"
          : "text";

  return (
    <Input
      {...common}
      type={inputType}
      inputMode={field.type === "money" ? "decimal" : undefined}
      step={field.type === "money" ? "0.01" : undefined}
      placeholder={field.placeholder ?? (field.type === "money" ? "0.00" : undefined)}
      value={value === undefined || value === null ? "" : String(value)}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  );
};

export const FieldRow = ({ field, value, onChange }: FieldProps) => (
  <div className={cn("space-y-1.5", field.span === 3 && "md:col-span-3", field.span === 2 && "md:col-span-2")}>
    {field.type !== "checkbox" && (
      <Label htmlFor={field.key} className="text-xs uppercase tracking-wide text-muted-foreground">
        {field.label}
      </Label>
    )}
    <FieldControl field={field} value={value} onChange={onChange} />
    {(field.provenance || field.hint) && (
      <p className="text-[11px] text-muted-foreground">
        {field.provenance && <Badge variant="outline" className="mr-1 font-normal">{field.provenance}</Badge>}
        {field.hint}
      </p>
    )}
  </div>
);

interface RecordFormProps {
  sections: SectionSpec[];
  values: RecordValues;
  onChange: (key: string, value: string | boolean) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  footerNote?: ReactNode;
  card?: boolean;
}

export const RecordForm = ({
  sections,
  values,
  onChange,
  onSubmit,
  submitLabel = "Save",
  secondaryLabel,
  onSecondary,
  footerNote,
  card = true,
}: RecordFormProps) => {
  const body = sections.map((section) => (
    <div key={section.title} className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide">{section.title}</h3>
        {section.description && (
          <p className="text-xs text-muted-foreground">{section.description}</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {section.fields.map((f) => (
          <FieldRow key={f.key} field={f} value={values[f.key]} onChange={onChange} />
        ))}
      </div>
    </div>
  ));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {card
        ? sections.map((section, i) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.description && (
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                )}
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {section.fields.map((f) => (
                  <FieldRow key={`${i}-${f.key}`} field={f} value={values[f.key]} onChange={onChange} />
                ))}
              </CardContent>
            </Card>
          ))
        : body}

      {footerNote}

      {onSubmit && (
        <div className="flex justify-end gap-2">
          {secondaryLabel && (
            <Button type="button" variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      )}
    </form>
  );
};

/** Hook that keeps a mutable record-form state. */
export const useRecordValues = (initial: RecordValues) => {
  const [values, setValues] = useState<RecordValues>(initial);
  const onChange = (key: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  return { values, setValues, onChange };
};

interface RecordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  sections: SectionSpec[];
  initial?: RecordValues;
  submitLabel?: string;
  onSubmit?: (values: RecordValues) => void;
  extra?: ReactNode;
}

export const RecordDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  sections,
  initial = {},
  submitLabel = "Save",
  onSubmit,
  extra,
}: RecordDrawerProps) => {
  const { values, onChange } = useRecordValues(initial);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <RecordForm
          card={false}
          sections={sections}
          values={values}
          onChange={onChange}
          submitLabel={submitLabel}
          secondaryLabel="Cancel"
          onSecondary={() => onOpenChange(false)}
          footerNote={extra}
          onSubmit={() => {
            onSubmit?.(values);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

interface RegisterProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const Register = ({ title, description, action, children }: RegisterProps) => (
  <Card>
    <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-3">
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);