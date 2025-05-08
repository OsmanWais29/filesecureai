
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, MessageSquare, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockSupportData } from '@/components/support/mockSupportData';
import { toast } from 'sonner';

const SupportPostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch the post from an API
    // For now, use mock data
    if (postId) {
      const foundPost = mockSupportData.topics.find(p => p.id.toString() === postId);
      setPost(foundPost || null);
      setReplies(foundPost?.replies || []);
    }
    setLoading(false);
  }, [postId]);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newReply = {
      id: Date.now(),
      authorId: 'current-user',
      authorName: 'Me',
      authorAvatar: '/avatars/01.png',
      content: reply,
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    setReplies([...replies, newReply]);
    setReply('');
    toast.success('Reply posted successfully');
  };

  const handleUpvote = () => {
    if (post) {
      setPost({ ...post, upvotes: (post.upvotes || 0) + 1 });
      toast.success('Post upvoted');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">Loading post details...</div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold">Post Not Found</h2>
            <p className="text-muted-foreground mt-2">The support post you're looking for couldn't be found.</p>
            <Button onClick={() => navigate('/support')} className="mt-4">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Support
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/support')} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Support
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <div className="flex items-center mt-2 space-x-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span>{post.authorName}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" /> {replies.length}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleUpvote}>
                  <ThumbsUp className="h-4 w-4 mr-1" /> {post.upvotes || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{post.content}</p>
            </div>
            <div className="flex flex-wrap mt-4 gap-2">
              {post.tags?.map((tag: string, index: number) => (
                <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Replies ({replies.length})</h3>
          {replies.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              Be the first to reply to this post!
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <Card key={reply.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.authorAvatar} />
                          <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{reply.authorName}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p>{reply.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a reply</CardTitle>
            <CardDescription>Share your thoughts or provide a solution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply}>
              <Textarea
                placeholder="Write your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={!reply.trim()}>
                  Post Reply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SupportPostDetail;
