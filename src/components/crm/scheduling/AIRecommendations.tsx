
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface AISuggestion {
  id: string;
  message: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
}

interface AIRecommendationsProps {
  suggestions: AISuggestion[];
}

export function AIRecommendations({ suggestions }: AIRecommendationsProps) {
  const priorityBgColors = {
    high: "border-l-4 border-red-500 bg-red-50",
    medium: "border-l-4 border-amber-500 bg-amber-50",
    low: "border-l-4 border-green-500 bg-green-50",
  };

  return (
    <div className="space-y-4">
      {suggestions.length === 0 ? (
        <p className="text-center text-muted-foreground">No recommendations available</p>
      ) : (
        suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={`${priorityBgColors[suggestion.priority]}`}>
            <CardContent className="p-3">
              <p className="text-sm mb-2">{suggestion.message}</p>
              {suggestion.actionable && (
                <Button variant="outline" size="sm" className="mt-1">Take Action</Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
