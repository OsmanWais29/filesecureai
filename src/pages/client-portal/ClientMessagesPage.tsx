
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  MessageCircle, 
  Send, 
  User, 
  PaperclipIcon, 
  Clock, 
  Search, 
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ClientMessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in a real implementation, this would come from your database
  const conversations = [
    { 
      id: "1", 
      with: "Jane Smith",
      role: "Trustee",
      avatar: "/lovable-uploads/01eb992b-a293-4ef9-a5ff-fa81da6a95ed.png",
      lastMessage: "Great, I'll review your bank statements and get back to you soon.",
      timestamp: "2025-05-05T14:30:00",
      unread: 0
    },
    { 
      id: "2", 
      with: "Robert Jones",
      role: "Financial Counselor",
      avatar: null,
      lastMessage: "Your budget planning is looking much better now. Great progress!",
      timestamp: "2025-05-03T09:15:00",
      unread: 2
    },
    { 
      id: "3", 
      with: "SecureFiles Support",
      role: "Support Team",
      avatar: null,
      lastMessage: "Hi there! How can we help you with your account today?",
      timestamp: "2025-05-01T16:45:00",
      unread: 0
    }
  ];

  const messages = {
    "1": [
      {
        id: "1-1",
        sender: "me",
        text: "Hello, I've uploaded my bank statements as requested. Could you please confirm you've received them?",
        timestamp: "2025-05-05T13:45:00"
      },
      {
        id: "1-2",
        sender: "Jane Smith",
        text: "Hi there! Yes, I can see them in the documents section. I'll review them today.",
        timestamp: "2025-05-05T14:10:00"
      },
      {
        id: "1-3",
        sender: "me",
        text: "Great, thank you! Is there anything else you need from me at this point?",
        timestamp: "2025-05-05T14:15:00"
      },
      {
        id: "1-4",
        sender: "Jane Smith",
        text: "Great, I'll review your bank statements and get back to you soon.",
        timestamp: "2025-05-05T14:30:00"
      }
    ],
    "2": [
      {
        id: "2-1",
        sender: "Robert Jones",
        text: "Hello! I've reviewed your budget worksheet and have some suggestions.",
        timestamp: "2025-05-03T09:00:00"
      },
      {
        id: "2-2",
        sender: "Robert Jones",
        text: "Your budget planning is looking much better now. Great progress!",
        timestamp: "2025-05-03T09:15:00"
      }
    ],
    "3": [
      {
        id: "3-1",
        sender: "SecureFiles Support",
        text: "Hi there! How can we help you with your account today?",
        timestamp: "2025-05-01T16:45:00"
      }
    ]
  };

  const filteredConversations = conversations.filter(
    convo => convo.with.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = selectedConversation ? conversations.find(c => c.id === selectedConversation) : null;
  const currentMessages = selectedConversation ? messages[selectedConversation as keyof typeof messages] || [] : [];

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      // In a real app, you would send this to your backend and update the state accordingly
      console.log("Sending message:", { conversationId: selectedConversation, text: messageText });
      setMessageText("");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Communicate securely with your trustee team</p>
      </div>

      <Card className="flex h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r hidden md:block">
          <div className="p-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => setSelectedConversation(null)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-81px)]">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {conversation.avatar ? (
                        <AvatarImage src={conversation.avatar} alt={conversation.with} />
                      ) : null}
                      <AvatarFallback>
                        {conversation.with.split(' ').map(name => name[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.with}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm truncate text-muted-foreground max-w-[180px]">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="rounded-full h-5 min-w-5 flex items-center justify-center p-0">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation Detail */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && currentConversation ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {currentConversation.avatar ? (
                        <AvatarImage src={currentConversation.avatar} alt={currentConversation.with} />
                      ) : null}
                      <AvatarFallback>
                        {currentConversation.with.split(' ').map(name => name[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentConversation.with}</p>
                      <p className="text-xs text-muted-foreground">{currentConversation.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="md:hidden">Back</Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'me' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                        <div className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <PaperclipIcon className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="rounded-full" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Conversation Selected</h3>
                <p className="text-muted-foreground mb-4">Select a conversation from the list or start a new one</p>
                <div className="md:hidden">
                  <Select onValueChange={(value) => setSelectedConversation(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select conversation" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversations.map((convo) => (
                        <SelectItem key={convo.id} value={convo.id}>
                          {convo.with} ({convo.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full mt-2" onClick={() => setSelectedConversation("1")}>
                    View Conversation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClientMessagesPage;
