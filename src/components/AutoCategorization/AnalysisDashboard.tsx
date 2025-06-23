
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalysisStats {
  totalDocuments: number;
  analyzedDocuments: number;
  highConfidenceCount: number;
  categorizedCount: number;
  formTypes: Array<{ name: string; count: number }>;
  riskFlags: Array<{ type: string; count: number }>;
}

export const AnalysisDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisStats();
  }, []);

  const loadAnalysisStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total documents
      const { count: totalDocs } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_folder', false);

      // Get analyzed documents
      const { data: analyses } = await supabase
        .from('ai_document_analysis')
        .select(`
          *,
          documents!inner(user_id)
        `)
        .eq('documents.user_id', user.id);

      // Get categorization data
      const { data: categorizations } = await supabase
        .from('document_categorization')
        .select(`
          *,
          documents!inner(user_id)
        `)
        .eq('documents.user_id', user.id);

      const analyzedCount = analyses?.length || 0;
      const highConfidenceCount = analyses?.filter(a => a.confidence_score >= 0.8).length || 0;
      const categorizedCount = categorizations?.filter(c => c.auto_applied).length || 0;

      // Process form types
      const formTypeCounts: Record<string, number> = {};
      analyses?.forEach(analysis => {
        const formType = analysis.identified_form_type || 'Unknown';
        formTypeCounts[formType] = (formTypeCounts[formType] || 0) + 1;
      });

      // Process risk flags
      const riskCounts: Record<string, number> = {};
      analyses?.forEach(analysis => {
        const risks = analysis.risk_flags || [];
        risks.forEach((risk: string) => {
          riskCounts[risk] = (riskCounts[risk] || 0) + 1;
        });
      });

      setStats({
        totalDocuments: totalDocs || 0,
        analyzedDocuments: analyzedCount,
        highConfidenceCount,
        categorizedCount,
        formTypes: Object.entries(formTypeCounts).map(([name, count]) => ({ name, count })),
        riskFlags: Object.entries(riskCounts).map(([type, count]) => ({ type, count }))
      });
    } catch (error) {
      console.error('Failed to load analysis stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const analysisProgress = stats.totalDocuments > 0 
    ? (stats.analyzedDocuments / stats.totalDocuments) * 100 
    : 0;

  const categorizationProgress = stats.analyzedDocuments > 0 
    ? (stats.categorizedCount / stats.analyzedDocuments) * 100 
    : 0;

  const chartColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Analyzed</p>
                <p className="text-2xl font-bold">{stats.analyzedDocuments}</p>
                <Progress value={analysisProgress} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold">{stats.highConfidenceCount}</p>
                <Badge variant="secondary" className="mt-1">
                  {stats.analyzedDocuments > 0 
                    ? Math.round((stats.highConfidenceCount / stats.analyzedDocuments) * 100)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Categorized</p>
                <p className="text-2xl font-bold">{stats.categorizedCount}</p>
                <Progress value={categorizationProgress} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Document Types Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.formTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.formTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No form type data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Flags Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.riskFlags.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.riskFlags}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ type, percent }) => 
                      `${type.replace(/_/g, ' ')}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {stats.riskFlags.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={chartColors[index % chartColors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No risk data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={loadAnalysisStats} variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button variant="outline" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Bulk Analyze (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
