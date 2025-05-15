
import React from "react";

export const RecentConversations: React.FC = () => {
  // This would be connected to a real data source in a full implementation
  const recentConversations = [
    {
      id: '1',
      title: 'Document Analysis Request',
      date: new Date(2023, 4, 15),
      module: 'document'
    },
    {
      id: '2',
      title: 'BIA Compliance Question',
      date: new Date(2023, 4, 10),
      module: 'legal'
    },
    {
      id: '3',
      title: 'System Training Session',
      date: new Date(2023, 4, 5),
      module: 'help'
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="font-medium mb-3">Recent Conversations</h3>
      <div className="space-y-2">
        {recentConversations.map(conversation => (
          <div 
            key={conversation.id}
            className="p-2 hover:bg-muted/50 rounded cursor-pointer text-sm"
          >
            <div className="font-medium truncate">{conversation.title}</div>
            <div className="text-xs text-muted-foreground">
              {conversation.date.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
