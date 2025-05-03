
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, ExternalLink, Clock, Trash2, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgendaItem {
  id: string;
  text: string;
  completed: boolean;
  timeEstimate: string;
}

interface MeetingAgendaProps {
  clientName?: string;
}

export const MeetingAgenda = ({ clientName }: MeetingAgendaProps) => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    { id: '1', text: 'Review previous meeting notes', completed: true, timeEstimate: '5 min' },
    { id: '2', text: 'Discuss progress on consumer proposal documentation', completed: false, timeEstimate: '15 min' },
    { id: '3', text: 'Review financial statements', completed: false, timeEstimate: '10 min' },
    { id: '4', text: 'Plan next steps and deadline updates', completed: false, timeEstimate: '10 min' },
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemTime, setNewItemTime] = useState('5');
  const { toast } = useToast();

  // Load saved agenda if available
  useEffect(() => {
    const savedAgenda = localStorage.getItem('meeting-agenda');
    if (savedAgenda) {
      try {
        setAgendaItems(JSON.parse(savedAgenda));
      } catch (error) {
        console.error("Failed to parse saved agenda:", error);
      }
    }
  }, []);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: AgendaItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
      timeEstimate: `${newItemTime} min`
    };
    
    setAgendaItems([...agendaItems, newItem]);
    setNewItemText('');
  };
  
  const handleToggleComplete = (id: string) => {
    setAgendaItems(
      agendaItems.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const handleDeleteItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
  };
  
  const handleSave = () => {
    localStorage.setItem('meeting-agenda', JSON.stringify(agendaItems));
    toast({
      title: "Agenda saved",
      description: "Your meeting agenda has been saved successfully",
    });
  };

  const openStandaloneWindow = () => {
    const features = 'width=500,height=700,resizable=yes,scrollbars=yes';
    const agendaWindow = window.open('/meetings/agenda-standalone', 'meetingAgenda', features);
    
    if (!agendaWindow) {
      toast({
        variant: "destructive",
        title: "Popup Blocked",
        description: "Please allow popups for this site to open the agenda in a new window.",
      });
    }
  };
  
  // Calculate estimated remaining time
  const remainingTime = agendaItems
    .filter(item => !item.completed)
    .reduce((total, item) => {
      const minutes = parseInt(item.timeEstimate.split(' ')[0], 10);
      return total + minutes;
    }, 0);
  
  // Calculate estimated total time
  const totalTime = agendaItems.reduce((total, item) => {
    const minutes = parseInt(item.timeEstimate.split(' ')[0], 10);
    return total + minutes;
  }, 0);
  
  // Calculate completion percentage
  const completedItems = agendaItems.filter(item => item.completed).length;
  const completionPercentage = agendaItems.length > 0 
    ? Math.round((completedItems / agendaItems.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Meeting Agenda</h2>
          <p className="text-sm text-muted-foreground">
            {clientName ? `Create and track agenda items for meeting with ${clientName}` : "Create and track agenda items for your meeting"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={openStandaloneWindow}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Pop Out
          </Button>
          
          <Button 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Agenda
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Weekly Status Meeting
          </CardTitle>
          <CardDescription>
            Track topics to cover and their estimated time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="agenda-item">New Agenda Item</Label>
              <Input
                id="agenda-item"
                placeholder="Enter agenda item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div className="w-full sm:w-24">
              <Label htmlFor="time-estimate">Time (min)</Label>
              <Input
                id="time-estimate"
                type="number"
                min="1"
                className="text-center"
                value={newItemTime}
                onChange={(e) => setNewItemTime(e.target.value)}
              />
            </div>
            <Button onClick={handleAddItem} className="sm:mt-0">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-2 mt-4">
            {agendaItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No agenda items added yet</p>
              </div>
            ) : (
              agendaItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    item.completed ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleToggleComplete(item.id)}
                      id={`item-${item.id}`}
                    />
                    <Label 
                      htmlFor={`item-${item.id}`}
                      className={`${item.completed ? 'line-through text-muted-foreground' : ''} cursor-pointer`}
                    >
                      {item.text}
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.timeEstimate}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 border-t pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-1 font-medium">{totalTime} min</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Remaining:</span>
              <span className="ml-1 font-medium">{remainingTime} min</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Completion:</span>
            <span className="ml-1 font-medium">{completionPercentage}%</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
