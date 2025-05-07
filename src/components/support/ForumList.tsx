
import { useState } from "react";
import { ForumPost, ForumPostProps } from "./ForumPost";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Flame, Clock, Award, MessageSquare } from "lucide-react";

// Mock data for forum posts
const mockPosts: ForumPostProps[] = [
  {
    id: "post-1",
    title: "How do I set up multi-province access for trustees?",
    author: "DavidTrustee",
    createdAt: "2 hours ago",
    content: "I'm trying to configure our system so trustees can access files from multiple provinces, but I'm running into permission issues. Has anyone successfully set this up? I followed the documentation but trustees can only see their primary province.",
    commentCount: 8,
    category: "Question",
    votes: 15,
    solved: true,
  },
  {
    id: "post-2",
    title: "Bug: Form 47 Risk Analysis not showing all compliance issues",
    author: "ComplianceOfficer",
    createdAt: "1 day ago",
    content: "When analyzing Form 47, the AI isn't detecting blank fields in Section 4. I've compared several forms and the system consistently misses required fields in this section. Has anyone else noticed this?",
    commentCount: 12,
    category: "Bug",
    votes: 24,
  },
  {
    id: "post-3",
    title: "Feature Request: Bulk Document Actions",
    author: "ProductivityGuru",
    createdAt: "3 days ago",
    content: "It would be really helpful to have bulk actions for documents, such as batch categorization, applying the same tag to multiple files, or moving several documents to a different folder at once.",
    commentCount: 5,
    category: "Feature Request",
    votes: 32,
  },
  {
    id: "post-4",
    title: "AI analysis getting stuck at 80% for large PDFs",
    author: "TechSupport22",
    createdAt: "5 days ago",
    content: "When uploading PDFs larger than 10MB, the AI analysis progress bar gets stuck at around 80%. The analysis never completes and I have to refresh the page. Anyone else experiencing this?",
    commentCount: 19,
    category: "Bug",
    votes: 28,
  },
];

export const ForumList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterCategory, setFilterCategory] = useState("all");

  // Filter posts based on search query and category
  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || post.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort posts based on selected sort order
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.votes - a.votes;
      case "recent":
        // For this example, we'll just use the mock data's order
        return mockPosts.indexOf(a) - mockPosts.indexOf(b);
      case "comments":
        return b.commentCount - a.commentCount;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
              <SelectItem value="feature request">Feature Requests</SelectItem>
              <SelectItem value="solved">Solved Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="popular" value={sortBy} onValueChange={setSortBy}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="popular" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Popular</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Recent</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Most Comments</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular" className="mt-2 space-y-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <ForumPost key={post.id} {...post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found.</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearchQuery("")}>
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-2 space-y-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <ForumPost key={post.id} {...post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found.</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearchQuery("")}>
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments" className="mt-2 space-y-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <ForumPost key={post.id} {...post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found.</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearchQuery("")}>
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
