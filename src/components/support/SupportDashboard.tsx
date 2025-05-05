
import { TrendingUp, MessageSquare, ThumbsUp, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockSupportData } from "./mockSupportData";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { toast } from "sonner";

interface SupportDashboardProps {
  selectedCategory: string;
  searchQuery: string;
}

export const SupportDashboard = ({ selectedCategory, searchQuery }: SupportDashboardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [displayCount, setDisplayCount] = useState(5);

  // Filter topics based on category and search query
  const filteredTopics = mockSupportData.topics.filter(topic => 
    (selectedCategory === "all" || topic.category === selectedCategory) &&
    (searchQuery === "" || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewMore = () => {
    if (displayCount + 5 >= filteredTopics.length) {
      setDisplayCount(filteredTopics.length);
      toast.success("You've reached the end of available discussions");
    } else {
      setDisplayCount(displayCount + 5);
      toast.success("Loaded more discussions");
    }
  };

  const handleViewThread = (topicId: string) => {
    // In a real app, this would navigate to the thread view
    toast.success(`Viewing thread: ${topicId}`);
  };

  return (
    <div className="px-4 max-w-full space-y-4">
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Trending Discussions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {filteredTopics.slice(0, displayCount).map((topic) => (
            <Card key={topic.id} className={`hover:shadow-md transition-shadow cursor-pointer ${isDarkMode ? 'hover:bg-accent/5' : 'hover:bg-accent/5'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">{topic.category}</Badge>
                    <CardTitle className="text-lg font-medium">{topic.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{topic.replies.length}</span>
                    <ThumbsUp className="h-4 w-4 ml-3 mr-1" />
                    <span>{topic.upvotes}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-3">
                  {topic.description}
                </CardDescription>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={topic.author.avatar} alt={topic.author.name} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Posted by {topic.author.name} • {topic.timestamp}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs gap-1"
                    onClick={() => handleViewThread(topic.id)}
                  >
                    View Thread
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No discussions found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? `No results matching "${searchQuery}"` 
                : "There are no discussions in this category yet"}
            </p>
            <Button>Start a New Discussion</Button>
          </div>
        )}
        
        {filteredTopics.length > displayCount && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={handleViewMore}>View More Discussions</Button>
          </div>
        )}
      </section>
    </div>
  );
};
