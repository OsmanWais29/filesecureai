
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  File,
  Folder
} from "lucide-react";

const documents = [
  {
    id: 1,
    title: "Initial Assessment Form",
    type: "Form",
    category: "Assessment",
    date: "2024-01-15",
    status: "Completed",
    size: "2.3 MB"
  },
  {
    id: 2,
    title: "Monthly Budget Worksheet",
    type: "Spreadsheet",
    category: "Financial",
    date: "2024-01-10",
    status: "In Progress",
    size: "1.8 MB"
  },
  {
    id: 3,
    title: "Debt Summary Report",
    type: "PDF",
    category: "Financial",
    date: "2024-01-08",
    status: "Completed",
    size: "3.1 MB"
  },
  {
    id: 4,
    title: "Trustee Meeting Notes",
    type: "Document",
    category: "Communications",
    date: "2024-01-05",
    status: "Completed",
    size: "956 KB"
  }
];

export const ClientDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "assessment", "financial", "communications"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Access and manage your case documents</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Request Document
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{doc.type}</Badge>
                        <Badge variant="secondary">{doc.category}</Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.date}
                        </span>
                        <span className="text-sm text-gray-500">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={doc.status === "Completed" ? "default" : "secondary"}
                    >
                      {doc.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto p-4 bg-blue-100 rounded-lg w-fit">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      <Badge variant="outline">{doc.type}</Badge>
                      <Badge variant="secondary">{doc.category}</Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {doc.date}
                  </div>
                  <div className="text-sm text-gray-500">{doc.size}</div>
                  <Badge 
                    variant={doc.status === "Completed" ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {doc.status}
                  </Badge>
                  <Button className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No documents available yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
