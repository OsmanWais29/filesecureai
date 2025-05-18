import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "../../types";
import { updateAnalysisStatus } from "../documentStatusUpdates";
import { AnalysisProcessContext } from "../types";

export const issuePrioritization = async (
  documentRecord: DocumentRecord,
  isForm76: boolean,
  context: AnalysisProcessContext
): Promise<void> => {
  const { setAnalysisStep, setProgress } = context;
  
  // Check if this is a Form 47 (Consumer Proposal)
  const isForm47 = documentRecord.metadata?.formType === 'form-47' || 
                  documentRecord.title?.toLowerCase().includes('form 47') ||
                  documentRecord.title?.toLowerCase().includes('consumer proposal');
  
  if (isForm76) {
    setAnalysisStep("Stage 5: Prioritizing Form 76 issues for action...");
  } else if (isForm47) {
    setAnalysisStep("Stage 5: Prioritizing Consumer Proposal issues for action...");
  } else {
    setAnalysisStep("Stage 5: Issue Prioritization & Task Management...");
  }
  
  setProgress(70);
  
  try {
    // Get existing document analysis
    const { data: analysisData } = await supabase
      .from('document_analysis')
      .select('content')
      .eq('document_id', documentRecord.id)
      .maybeSingle();
      
    // Handle content safely
    const content = analysisData?.content || {};
    const risks = (content && typeof content === 'object' && 'risks' in content) 
      ? (Array.isArray(content.risks) ? content.risks : []) 
      : [];
    
    // Create tasks based on high priority risks
    const highPriorityRisks = risks.filter(risk => risk && typeof risk === 'object' && risk.severity === 'high');
    
    if (highPriorityRisks.length > 0) {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      for (const risk of highPriorityRisks) {
        if (risk && typeof risk === 'object') {
          await supabase
            .from('tasks')
            .insert({
              title: risk.description || 'Risk identified',
              description: `${risk.impact || 'High impact risk'} - ${risk.requiredAction || 'Action required'}`,
              document_id: documentRecord.id,
              created_by: userData?.user?.id,
              severity: risk.severity || 'high',
              regulation: risk.regulation || '',
              solution: risk.solution || '',
              due_date: risk.deadline ? calculateDueDate(risk.deadline) : null,
              status: 'pending'
            });
        }
      }
      
      console.log(`Created ${highPriorityRisks.length} tasks from high priority risks`);
    }
    
    // For Form 47, also create tasks for medium priority risks
    if (isForm47) {
      const mediumPriorityRisks = risks.filter(risk => 
        risk && typeof risk === 'object' && risk.severity === 'medium'
      );
      
      if (mediumPriorityRisks.length > 0) {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        
        for (const risk of mediumPriorityRisks) {
          if (risk && typeof risk === 'object') {
            await supabase
              .from('tasks')
              .insert({
                title: risk.description || 'Risk identified',
                description: `${risk.impact || 'Medium impact risk'} - ${risk.requiredAction || 'Action required'}`,
                document_id: documentRecord.id,
                created_by: userData?.user?.id,
                severity: risk.severity || 'medium',
                regulation: risk.regulation || '',
                solution: risk.solution || '',
                due_date: risk.deadline ? calculateDueDate(risk.deadline) : null,
                status: 'pending'
              });
          }
        }
        
        console.log(`Created ${mediumPriorityRisks.length} tasks from medium priority risks for Form 47`);
      }
      
      // Create notification for Form 47 submission deadline
      if (documentRecord.metadata?.submissionDeadline) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          await supabase.functions.invoke('handle-notifications', {
            body: {
              action: 'create',
              userId: userData?.user?.id,
              notification: {
                title: 'Consumer Proposal Deadline',
                message: `Form 47 for ${documentRecord.metadata?.clientName || 'client'} must be submitted by ${documentRecord.metadata?.submissionDeadline}`,
                type: 'deadline',
                category: 'compliance',
                priority: 'high',
                action_url: `/documents/${documentRecord.id}`,
                metadata: {
                  documentId: documentRecord.id,
                  deadline: documentRecord.metadata?.submissionDeadline,
                  formType: 'form-47'
                }
              }
            }
          });
          console.log('Created deadline notification for Form 47');
        } catch (error) {
          console.error('Error creating deadline notification:', error);
        }
      }
    }
    
    // Update document with risk assessment status
    await updateAnalysisStatus(documentRecord, 'task_creation', 'risk_assessment_completed');
    console.log('Issue prioritization completed successfully');
    
  } catch (error) {
    console.error('Error in issue prioritization stage:', error);
    // Continue with the process even if task creation fails partially
  }
};

// Helper function to calculate due date based on deadline string
function calculateDueDate(deadline: string): string | null {
  if (deadline.toLowerCase() === 'immediately') {
    return new Date().toISOString();
  }
  
  const match = deadline.match(/(\d+)\s*(day|days)/i);
  if (match) {
    const days = parseInt(match[1]);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString();
  }
  
  // Try to parse as a date
  try {
    const parsedDate = new Date(deadline);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  return null;
}
