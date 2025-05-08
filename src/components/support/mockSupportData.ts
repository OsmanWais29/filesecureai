
export const mockSupportData = {
  topics: [
    {
      id: "topic-1",
      title: "How to upload multi-page documents",
      category: "general",
      description: "Learn how to properly upload and process multi-page documents in the system for optimal analysis.",
      upvotes: 24,
      createdAt: "2025-04-06T12:00:00Z", 
      timestamp: "2 days ago",
      content: "I'm trying to upload a multi-page document but I'm not sure of the best way to do it. Should I scan each page individually or upload the entire document as one PDF?",
      authorName: "John Smith",
      authorAvatar: "/avatars/01.png",
      tags: ["documents", "upload", "scanning"],
      replies: [
        {
          id: "reply-1",
          authorName: "Anna Johnson",
          authorAvatar: "/avatars/02.png",
          content: "You can upload multi-page PDFs directly. The system will automatically process each page.",
          createdAt: "2025-04-07T12:00:00Z",
          timestamp: "1 day ago",
          upvotes: 3
        },
        {
          id: "reply-2",
          authorName: "Support Team",
          authorAvatar: "/avatars/support.png",
          content: "For best results, ensure your PDF is properly formatted and under 20MB in size.",
          createdAt: "2025-04-08T00:00:00Z",
          timestamp: "12 hours ago",
          upvotes: 2
        }
      ]
    },
    {
      id: "topic-2",
      title: "AI analysis not recognizing form fields correctly",
      category: "ai",
      description: "The AI seems to be missing key fields on my Form 47 documents. Is there a way to improve recognition?",
      upvotes: 18,
      createdAt: "2025-04-05T12:00:00Z",
      timestamp: "3 days ago",
      content: "I've noticed that the AI is struggling to recognize some key fields on Form 47 documents. Has anyone found a solution to improve field recognition?",
      authorName: "Maria Garcia",
      authorAvatar: "/avatars/03.png",
      tags: ["ai", "form-47", "ocr"],
      replies: [
        {
          id: "reply-3",
          authorName: "Technical Support",
          authorAvatar: "/avatars/support.png",
          content: "We've recently improved our Form 47 recognition. Try re-uploading your document or use the manual field entry feature.",
          createdAt: "2025-04-06T12:00:00Z",
          timestamp: "2 days ago",
          upvotes: 5
        }
      ]
    },
    {
      id: "topic-3",
      title: "Best practices for organizing client documents",
      category: "general",
      description: "Looking for recommendations on how to efficiently organize large numbers of client documents in the system.",
      upvotes: 32,
      createdAt: "2025-04-03T12:00:00Z",
      timestamp: "5 days ago",
      content: "I'm handling dozens of clients, each with many documents. What's the best way to organize these in the system for quick access?",
      authorName: "Robert Chen",
      authorAvatar: "/avatars/04.png",
      tags: ["organization", "workflow", "efficiency"],
      replies: [
        {
          id: "reply-4",
          authorName: "Emily Wilson",
          authorAvatar: "/avatars/05.png",
          content: "I use client name folders with subfolders for document types. The AI folder recommendations feature is also helpful.",
          createdAt: "2025-04-04T12:00:00Z",
          timestamp: "4 days ago",
          upvotes: 8
        },
        {
          id: "reply-5",
          authorName: "Michael Brown",
          authorAvatar: "/avatars/06.png",
          content: "Don't forget you can set up automated workflows to sort new documents as they come in.",
          createdAt: "2025-04-05T12:00:00Z",
          timestamp: "3 days ago",
          upvotes: 6
        },
        {
          id: "reply-6",
          authorName: "Support Team",
          authorAvatar: "/avatars/support.png",
          content: "Check out our KB article on document organization: link-to-article",
          createdAt: "2025-04-06T12:00:00Z",
          timestamp: "2 days ago",
          upvotes: 3
        }
      ]
    },
    {
      id: "topic-4",
      title: "Compliance requirements for storing client financial data",
      category: "legal",
      description: "What are the key compliance requirements we need to follow when storing sensitive financial information?",
      upvotes: 41,
      createdAt: "2025-04-01T12:00:00Z",
      timestamp: "1 week ago",
      content: "I need to make sure our document storage is compliant with regulations for financial data. What requirements should I be aware of?",
      authorName: "Sarah Johnson",
      authorAvatar: "/avatars/07.png",
      tags: ["compliance", "security", "regulations"],
      replies: [
        {
          id: "reply-7",
          authorName: "Legal Team",
          authorAvatar: "/avatars/legal.png",
          content: "Our system is fully compliant with PIPEDA requirements. Make sure you're using the secured client folders feature.",
          createdAt: "2025-04-02T12:00:00Z",
          timestamp: "6 days ago",
          upvotes: 12
        }
      ]
    },
    {
      id: "topic-5",
      title: "Request for bulk document export feature",
      category: "feature",
      description: "It would be great to have a way to export multiple documents at once, especially for client file transfers.",
      upvotes: 29,
      createdAt: "2025-03-25T12:00:00Z",
      timestamp: "2 weeks ago",
      content: "Currently I have to download files one by one. Could we get a feature to select and export multiple documents at once?",
      authorName: "Thomas Lee",
      authorAvatar: "/avatars/08.png",
      tags: ["feature-request", "export", "bulk-actions"],
      replies: [
        {
          id: "reply-8",
          authorName: "Product Team",
          authorAvatar: "/avatars/product.png",
          content: "Thanks for the suggestion! We're currently working on a bulk export feature scheduled for release next quarter.",
          createdAt: "2025-04-01T12:00:00Z",
          timestamp: "1 week ago",
          upvotes: 17
        }
      ]
    },
    {
      id: "topic-6",
      title: "Integration with DocuSign best practices",
      category: "general",
      description: "Looking for tips on the most efficient workflow for sending documents for client signature via DocuSign.",
      upvotes: 15,
      createdAt: "2025-04-05T12:00:00Z",
      timestamp: "3 days ago",
      content: "We just enabled DocuSign integration. What are some best practices for efficient document signing workflows?",
      authorName: "Jessica Martinez",
      authorAvatar: "/avatars/09.png",
      tags: ["docusign", "integration", "workflows"],
      replies: [
        {
          id: "reply-9",
          authorName: "William Turner",
          authorAvatar: "/avatars/10.png",
          content: "I've found that setting up templates for common documents saves a ton of time in the long run.",
          createdAt: "2025-04-06T12:00:00Z",
          timestamp: "2 days ago",
          upvotes: 5
        }
      ]
    }
  ],
  faq: [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. Follow the instructions sent to your email address."
    },
    {
      question: "Can I share documents with clients directly from the platform?",
      answer: "Yes, you can share documents using the 'Share' button on any document. You can set permissions and expiration dates for shared links."
    },
    {
      question: "How secure is my data in the system?",
      answer: "We use industry-standard encryption and security protocols. All data is encrypted both in transit and at rest, and we perform regular security audits."
    }
  ]
};
