
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaskGenerationRequest {
  documentId: string;
  riskAssessments: any[];
  formNumber?: string;
  documentAnalysis?: any;
  userContext?: {
    userId: string;
    role: string;
    expertise: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { 
      documentId, 
      riskAssessments = [], 
      formNumber, 
      documentAnalysis,
      userContext 
    }: TaskGenerationRequest = await req.json()

    console.log('AI Task Generator - Processing request for document:', documentId)

    // Get DeepSeek API key
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured')
    }

    // Get document details
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('title, metadata, type')
      .eq('id', documentId)
      .single()

    if (docError) {
      throw new Error(`Failed to fetch document: ${docError.message}`)
    }

    // Get available task templates
    const { data: templates, error: templatesError } = await supabaseClient
      .from('task_templates')
      .select('*')
      .eq('is_active', true)

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
    }

    // Create comprehensive task generation prompt
    const taskPrompt = `
You are an AI Task Management System specialized in Canadian BIA (Bankruptcy and Insolvency Act) compliance and workflow automation. Generate intelligent, actionable tasks based on document analysis and risk assessments.

DOCUMENT CONTEXT:
- Document ID: ${documentId}
- Document Title: ${document.title}
- Form Number: ${formNumber || 'Auto-detect'}
- Document Type: ${document.type || 'Unknown'}

RISK ASSESSMENTS:
${JSON.stringify(riskAssessments, null, 2)}

DOCUMENT ANALYSIS:
${JSON.stringify(documentAnalysis, null, 2)}

USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

AVAILABLE TASK TEMPLATES:
${JSON.stringify(templates, null, 2)}

TASK GENERATION REQUIREMENTS:

1. **Risk-Based Task Creation**
   - Generate specific tasks for each identified risk
   - Prioritize based on BIA compliance requirements
   - Include regulatory references and deadlines

2. **Form-Specific Workflows**
   - Create tasks based on form requirements
   - Include validation steps and compliance checks
   - Set appropriate deadlines based on BIA timelines

3. **Intelligent Task Attributes**
   - Priority: high, medium, low (based on risk severity)
   - Category: compliance, analysis, review, filing, etc.
   - Estimated duration in minutes
   - Dependencies between tasks
   - Compliance deadlines
   - Required expertise/skills

4. **AI-Enhanced Features**
   - Auto-assignment based on form type and user expertise
   - Intelligent task sequencing
   - Deadline calculation with buffer periods
   - Template-based task generation

5. **Collaboration Elements**
   - Multi-user assignments when needed
   - Clear task descriptions with context
   - Required approvals and reviews
   - Notification triggers

RESPONSE FORMAT:
Generate a JSON response with an array of tasks:

{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Detailed description with context and requirements",
      "priority": "high|medium|low",
      "category": "compliance|analysis|review|filing|validation",
      "severity": "high|medium|low",
      "estimated_duration": 60,
      "form_number": "Form XX",
      "bia_section": "Section XXX",
      "regulation": "BIA Section reference",
      "solution": "Specific solution or action steps",
      "compliance_deadline": "2024-XX-XX",
      "dependencies": ["task_id_1", "task_id_2"],
      "tags": ["risk", "compliance", "urgent"],
      "ai_confidence_score": 0.95,
      "template_id": "template_uuid_if_applicable",
      "auto_assign": true,
      "required_expertise": ["bankruptcy_law", "form_analysis"]
    }
  ],
  "workflow_suggestions": [
    {
      "name": "Suggested workflow name",
      "description": "Workflow description",
      "task_sequence": ["task_1", "task_2", "task_3"],
      "estimated_total_time": 180
    }
  ],
  "compliance_alerts": [
    {
      "type": "deadline_warning",
      "message": "Alert message",
      "deadline": "2024-XX-XX",
      "severity": "high"
    }
  ]
}

Generate comprehensive, intelligent tasks that ensure BIA compliance and efficient workflow management.
`

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: 'You are an AI Task Management System specialized in BIA compliance and bankruptcy workflow automation. Generate intelligent, actionable tasks with proper prioritization and deadline management.'
          },
          {
            role: 'user',
            content: taskPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    })

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`)
    }

    const deepseekData = await deepseekResponse.json()
    const taskGenerationResult = deepseekData.choices[0].message.content
    const reasoning = deepseekData.choices[0].message.reasoning || 'AI task generation applied'

    console.log('DeepSeek task generation completed')

    // Parse the generated tasks
    let generatedTasks
    try {
      generatedTasks = JSON.parse(taskGenerationResult)
    } catch (parseError) {
      console.error('Failed to parse task generation result:', parseError)
      // Fallback task generation
      generatedTasks = {
        tasks: [
          {
            title: 'AI-Generated Document Review',
            description: 'Review document for compliance and risk factors based on AI analysis',
            priority: 'medium',
            category: 'review',
            severity: 'medium',
            estimated_duration: 60,
            form_number: formNumber,
            ai_confidence_score: 0.85,
            auto_assign: true
          }
        ],
        workflow_suggestions: [],
        compliance_alerts: []
      }
    }

    // Insert generated tasks into database
    const createdTasks = []
    
    for (const taskData of generatedTasks.tasks || []) {
      const { data: newTask, error: taskError } = await supabaseClient
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'general',
          severity: taskData.severity || 'medium',
          estimated_duration: taskData.estimated_duration,
          form_number: taskData.form_number,
          bia_section: taskData.bia_section,
          regulation: taskData.regulation,
          solution: taskData.solution,
          compliance_deadline: taskData.compliance_deadline,
          tags: taskData.tags || [],
          ai_confidence_score: taskData.ai_confidence_score,
          ai_generated: true,
          document_id: documentId,
          created_by: userContext?.userId || 'system',
          status: 'pending'
        })
        .select()
        .single()

      if (taskError) {
        console.error('Error creating task:', taskError)
        continue
      }

      // Auto-assign task if requested
      if (taskData.auto_assign && newTask) {
        try {
          await supabaseClient.rpc('assign_task_by_expertise', {
            task_id: newTask.id,
            form_number: taskData.form_number
          })
        } catch (assignError) {
          console.error('Error auto-assigning task:', assignError)
        }
      }

      createdTasks.push(newTask)
    }

    // Update document with task generation status
    await supabaseClient
      .from('documents')
      .update({
        metadata: {
          ...document.metadata,
          ai_tasks_generated: true,
          task_generation_date: new Date().toISOString(),
          generated_task_count: createdTasks.length
        }
      })
      .eq('id', documentId)

    return new Response(
      JSON.stringify({
        success: true,
        generated_tasks: createdTasks,
        workflow_suggestions: generatedTasks.workflow_suggestions || [],
        compliance_alerts: generatedTasks.compliance_alerts || [],
        reasoning: reasoning,
        task_count: createdTasks.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI Task Generator error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
