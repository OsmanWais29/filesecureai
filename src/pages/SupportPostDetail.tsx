
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowUp, ArrowDown, Clock, Check, MessageSquare, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ForumLayout } from "@/components/support/ForumLayout";
import { AIAssistantModal } from "@/components/support/AIAssistantModal";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  votes: number;
  isAnswer?: boolean;
}

// Mock post data
const mockPost = {
  id: "post-1",
  title: "How do I set up multi-province access for trustees?",
  author: "DavidTrustee",
  authorAvatar: "/avatars/01.png",
  createdAt: "2 hours ago",
  content: "I'm trying to configure our system so trustees can access files from multiple provinces, but I'm running into permission issues. Has anyone successfully set this up?\n\nI followed the documentation but trustees can only see their primary province. Here's what I've tried so far:\n\n1. Updated the User Management settings\n2. Added secondary provinces in the trustee profile\n3. Verified permissions in the role settings\n\nAny help would be greatly appreciated!",
  commentCount: 8,
  category: "Question",
  votes: 15,
  solved: true,
};

// Mock comments
const mockComments: Comment[] = [
  {
    id: "comment-1",
    author: "SupportAgent",
    authorAvatar: "/avatars/02.png",
    content: "Hi David! To set up multi-province access for trustees, you need to go to Settings > Role Management > Trustee Roles and enable the 'Cross-Province Access' toggle. After that, you can assign specific provinces to each trustee in their user profile.\n\nMake sure you also have admin privileges to make these changes.",
    createdAt: "1 hour ago",
    votes: 8,
    isAnswer: true,
  },
  {
    id: "comment-2",
    author: "TechGuru",
    content: "I had this same issue last month. The key is that you need to apply the changes at both the role level AND the individual user level. The UI isn't super clear about this requirement.",
    createdAt: "45 minutes ago",
    votes: 5,
  },
  {
    id: "comment-3",
    author: "DavidTrustee",
    authorAvatar: "/avatars/01.png",
    content: "Thank you both! This solved my issue. I missed the role management part and was only trying to update the individual user settings.",
    createdAt: "30 minutes ago",
    votes: 2,
  },
];

const SupportPostDetail = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [postVotes, setPostVotes] = useState(mockPost.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [commentVotes, setCommentVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  const handlePostVote = (direction: 'up' | 'down') => {
    if (userVote === direction) {
      // Cancel vote
      setUserVote(null);
      setPostVotes(mockPost.votes);
    } else {
      // Apply new vote
      const difference = userVote === null 
        ? (direction === 'up' ? 1 : -1)
        : (direction === 'up' ? 2 : -2); // Switching from downvote to upvote is a +2 change
      
      setUserVote(direction);
      setPostVotes(mockPost.votes + difference);
    }
  };

  const handleCommentVote = (commentId: string, direction: 'up' | 'down') => {
    setCommentVotes(prev => {
      const currentVote = prev[commentId];
      
      if (currentVote === direction) {
        // Cancel vote
        const newVotes = {...prev};
        delete newVotes[commentId];
        return newVotes;
      } else {
        // Apply new vote
        return {
          ...prev,
          [commentId]: direction,
        };
      }
    });
  };

  const getCommentVoteCount = (commentId: string, originalVotes: number) => {
    const userVote = commentVotes[commentId];
    if (!userVote) return originalVotes;
    
    return userVote === 'up' ? originalVotes + 1 : originalVotes - 1;
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: "CurrentUser",
      authorAvatar: "/avatars/06.png",
      content: commentText,
      createdAt: "Just now",
      votes: 0,
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  // Check if post exists (we'd normally fetch based on postId)
  if (!mockPost) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/support")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Support
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ForumLayout
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowChatbot={setShowChatbot}
        >
          <div>
            <div className="p-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/support")} 
                className="mb-4 hover:bg-transparent px-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Button>

              {/* Post Card */}
              <div className="flex mb-6">
                {/* Vote column */}
                <div className="bg-muted/50 flex flex-col items-center py-4 px-2 mr-4 rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8",
                      userVote === 'up' && "text-accent"
                    )}
                    onClick={() => handlePostVote('up')}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  
                  <span className="text-sm font-medium my-1">{postVotes}</span>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8",
                      userVote === 'down' && "text-destructive"
                    )}
                    onClick={() => handlePostVote('down')}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Content column */}
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="outline">
                      {mockPost.category}
                    </Badge>
                    {mockPost.solved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Solved
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-semibold mb-2">{mockPost.title}</h1>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={mockPost.authorAvatar} />
                        <AvatarFallback>{mockPost.author[0]}</AvatarFallback>
                      </Avatar>
                      <span>{mockPost.author}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{mockPost.createdAt}</span>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    {mockPost.content.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {comments.length} Comments
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              {/* Comments Section */}
              <div>
                <h2 className="text-lg font-semibold mb-4">{comments.length} Comments</h2>
                
                {comments.map((comment) => (
                  <div key={comment.id} className="flex mb-6">
                    {/* Vote column */}
                    <div className="bg-muted/50 flex flex-col items-center py-2 px-1 mr-3 rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-6 w-6",
                          commentVotes[comment.id] === 'up' && "text-accent"
                        )}
                        onClick={() => handleCommentVote(comment.id, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      
                      <span className="text-xs font-medium my-1">{getCommentVoteCount(comment.id, comment.votes)}</span>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-6 w-6",
                          commentVotes[comment.id] === 'down' && "text-destructive"
                        )}
                        onClick={() => handleCommentVote(comment.id, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Comment content */}
                    <div className={cn(
                      "flex-1 rounded-md border p-4",
                      comment.isAnswer && "border-green-500 bg-green-50/20"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground ml-2">{comment.createdAt}</span>
                        </div>
                        
                        {comment.isAnswer && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
                            <Check className="h-3 w-3 mr-1" /> Solution
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm mt-1">
                        {comment.content.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add comment form */}
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-3">Add a comment</h3>
                  <Textarea
                    placeholder="Write your comment..."
                    className="min-h-[100px] mb-3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                  >
                    Submit Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ForumLayout>
        
        <AIAssistantModal
          open={showChatbot}
          onOpenChange={setShowChatbot}
        />
      </div>
    </MainLayout>
  );
};

export default SupportPostDetail;
