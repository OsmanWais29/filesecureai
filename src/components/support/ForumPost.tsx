
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowUp, ArrowDown, Clock, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface ForumPostProps {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  content: string;
  commentCount: number;
  category: string;
  votes: number;
  solved?: boolean;
}

export const ForumPost = ({
  id,
  title,
  author,
  authorAvatar,
  createdAt,
  content,
  commentCount,
  category,
  votes: initialVotes,
  solved,
}: ForumPostProps) => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (direction: 'up' | 'down') => {
    if (userVote === direction) {
      // Cancel vote
      setUserVote(null);
      setVotes(initialVotes);
    } else {
      // Apply new vote
      const difference = userVote === null 
        ? (direction === 'up' ? 1 : -1)
        : (direction === 'up' ? 2 : -2); // Switching from downvote to upvote is a +2 change
      
      setUserVote(direction);
      setVotes(initialVotes + difference);
    }
  };

  return (
    <Card 
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => navigate(`/support/post/${id}`)}
    >
      <div className="flex">
        {/* Vote column */}
        <div 
          className="bg-muted/50 flex flex-col items-center py-4 px-2 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8",
              userVote === 'up' && "text-accent"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleVote('up');
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          
          <span className="text-sm font-medium my-1">{votes}</span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8",
              userVote === 'down' && "text-destructive"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleVote('down');
            }}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content column */}
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mr-1">
                {category}
              </Badge>
              {solved && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Solved
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold mt-1">{title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{author[0]}</AvatarFallback>
                </Avatar>
                <span>{author}</span>
              </div>
              <span className="mx-2">•</span>
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{createdAt}</span>
            </div>
          </CardHeader>
          
          <CardContent className="text-muted-foreground line-clamp-2">
            <p>{content}</p>
          </CardContent>
          
          <CardFooter className="pt-0 pb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                {commentCount} Comments
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
