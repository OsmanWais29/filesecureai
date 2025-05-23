
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddDeadlineFormProps } from "./types";

export const AddDeadlineForm: React.FC<AddDeadlineFormProps> = ({ onAdd, onCancel }) => {
  const [deadline, setDeadline] = useState({
    title: "",
    dueDate: "", 
    description: "",
    priority: "medium",
    status: "pending"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deadline.title && deadline.dueDate) {
      onAdd({
        ...deadline,
        id: crypto.randomUUID()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <div>
        <Input
          placeholder="Deadline title"
          value={deadline.title}
          onChange={(e) => setDeadline({ ...deadline, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Input
          type="datetime-local"
          value={deadline.dueDate}
          onChange={(e) => setDeadline({ ...deadline, dueDate: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Description (optional)"
          value={deadline.description}
          onChange={(e) => setDeadline({ ...deadline, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div>
        <Select 
          value={deadline.priority}
          onValueChange={(value) => setDeadline({ ...deadline, priority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Add Deadline
        </Button>
      </div>
    </form>
  );
};
