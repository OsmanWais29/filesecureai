
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText,
  Search,
  Book,
  Video,
  Users
} from "lucide-react";

const TrusteeSupport = () => {
  const faqs = [
    {
      question: "How do I upload documents for AI analysis?",
      answer: "Navigate to the Documents section and use the upload button. Our AI will automatically analyze bankruptcy forms and identify risks."
    },
    {
      question: "What types of documents can SecureFiles AI analyze?",
      answer: "We support all OSB forms (1-96), financial statements, consumer proposals, and bankruptcy-related documents."
    },
    {
      question: "How accurate is the risk assessment?",
      answer: "Our AI achieves 95%+ accuracy in identifying compliance risks and missing information in bankruptcy forms."
    },
    {
      question: "Can I customize the risk assessment criteria?",
      answer: "Yes, you can adjust risk thresholds and compliance rules in the Settings section under Risk Management."
    }
  ];

  const supportCategories = [
    {
      title: "Technical Support",
      description: "Get help with system issues and technical problems",
      icon: MessageSquare,
      action: "Open Ticket"
    },
    {
      title: "Training Resources",
      description: "Access tutorials and training materials",
      icon: Book,
      action: "View Resources"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: Video,
      action: "Watch Videos"
    },
    {
      title: "Community Forum",
      description: "Connect with other trustees and share knowledge",
      icon: Users,
      action: "Join Forum"
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-1">Get help with SecureFiles AI and access training resources.</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Phone className="h-8 w-8 text-blue-500 mx-auto" />
              <CardTitle>Phone Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Speak directly with our support team</p>
              <p className="font-semibold text-lg">1-800-SECURE-AI</p>
              <p className="text-sm text-gray-500">Mon-Fri: 8AM-6PM EST</p>
              <Button className="mt-4 w-full">Call Now</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mail className="h-8 w-8 text-green-500 mx-auto" />
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Send us detailed questions</p>
              <p className="font-semibold">support@securefiles.ai</p>
              <p className="text-sm text-gray-500">Response within 2 hours</p>
              <Button className="mt-4 w-full">Send Email</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Get instant help from our team</p>
              <p className="font-semibold">Available 24/7</p>
              <p className="text-sm text-gray-500">Average wait: 30 seconds</p>
              <Button className="mt-4 w-full">Start Chat</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Support Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Support Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <category.icon className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{category.title}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {category.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <select className="w-full border border-input rounded-md px-3 py-2">
                    <option>Low - General question</option>
                    <option>Medium - Feature request</option>
                    <option>High - System issue</option>
                    <option>Critical - Unable to work</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Please provide detailed information about your issue..."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Attach Files</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag files here or <span className="text-blue-500 cursor-pointer">browse</span>
                    </p>
                  </div>
                </div>
                <Button className="w-full">Submit Request</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All FAQs</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Page */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>AI Analysis Service</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Document Upload</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>E-Filing Integration</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Maintenance
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">View Status Page</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeSupport;
