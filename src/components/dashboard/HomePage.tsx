
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Shield, 
  TrendingUp,
  Bell,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  Brain,
  DollarSign,
  FileSearch,
  BarChart3,
  MessageSquare,
  Activity,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  const quickActionCards = [
    {
      title: "Document Management",
      description: "Upload, analyze, and manage bankruptcy forms",
      icon: FileText,
      action: () => navigate("/documents"),
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "SAFA - AI Assistant",
      description: "Smart AI Financial Assistant for analysis",
      icon: Brain,
      action: () => navigate("/safa"),
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "CRM & Client Portal",
      description: "Manage client relationships and communications",
      icon: Users,
      action: () => navigate("/crm"),
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "PDF to XML Converter",
      description: "Convert documents between formats",
      icon: FileSearch,
      action: () => navigate("/advanced-features"),
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Smart Income Analysis",
      description: "AI-powered income and expense tracking",
      icon: DollarSign,
      action: () => navigate("/advanced-features"),
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Analytics & Reports",
      description: "Business intelligence and insights",
      icon: BarChart3,
      action: () => navigate("/advanced-features"),
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            SecureFiles AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional Trustee Portal - Powered by AI
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Compliance: 98.5%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button className="shadow-sm bg-gradient-to-r from-primary to-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">127</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +12 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1,843</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +3.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">98.5%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              +0.3% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">2,847</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-600" />
              Documents processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActionCards.map((card, index) => (
          <Card 
            key={index}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-0 overflow-hidden"
            onClick={card.action}
          >
            <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white shadow-lg`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{card.description}</p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              >
                Access {card.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  action: "Form 47 analyzed successfully", 
                  client: "John Smith", 
                  time: "2 minutes ago", 
                  type: "success",
                  icon: CheckCircle,
                  color: "text-green-600"
                },
                { 
                  action: "Risk assessment completed", 
                  client: "Sarah Johnson", 
                  time: "1 hour ago", 
                  type: "info",
                  icon: Eye,
                  color: "text-blue-600"
                },
                { 
                  action: "Document requires attention", 
                  client: "Mike Wilson", 
                  time: "3 hours ago", 
                  type: "warning",
                  icon: AlertTriangle,
                  color: "text-orange-600"
                },
                { 
                  action: "Client consultation scheduled", 
                  client: "Lisa Brown", 
                  time: "1 day ago", 
                  type: "info",
                  icon: Calendar,
                  color: "text-purple-600"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full bg-background shadow-sm ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">Client: {activity.client}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: FileText, label: "Upload Document", color: "text-blue-600" },
                { icon: Users, label: "Add Client", color: "text-green-600" },
                { icon: Brain, label: "AI Analysis", color: "text-purple-600" },
                { icon: Shield, label: "Compliance Check", color: "text-emerald-600" },
                { icon: Calendar, label: "Schedule Meeting", color: "text-orange-600" },
                { icon: BarChart3, label: "Generate Report", color: "text-indigo-600" }
              ].map((action, index) => (
                <Button 
                  key={index}
                  className="w-full justify-start gap-3 h-12" 
                  variant="ghost"
                >
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
