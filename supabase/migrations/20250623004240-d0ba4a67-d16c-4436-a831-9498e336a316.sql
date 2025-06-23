
-- Enhance the existing tasks table with additional fields for AI-powered task management
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT NULL, -- in minutes
ADD COLUMN IF NOT EXISTS actual_duration INTEGER DEFAULT NULL, -- in minutes
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS risk_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS form_number TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bia_section TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS compliance_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_template_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(3,2) DEFAULT NULL;

-- Create task templates table for common BIA form workflows
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  form_number TEXT,
  bia_section TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  default_assignee_role TEXT,
  template_steps JSONB DEFAULT '[]'::jsonb,
  compliance_requirements JSONB DEFAULT '{}'::jsonb,
  deadline_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create task assignments table for better tracking
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create task comments table for collaboration
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_system_comment BOOLEAN DEFAULT false
);

-- Create task deadlines tracking table
CREATE TABLE IF NOT EXISTS task_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  deadline_type TEXT NOT NULL, -- 'bia_filing', 'court_submission', 'review', etc.
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  buffer_days INTEGER DEFAULT 3,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_number TEXT,
  bia_section TEXT
);

-- Insert sample task templates for common BIA forms
INSERT INTO task_templates (name, description, form_number, bia_section, category, priority, estimated_duration, template_steps, compliance_requirements, deadline_rules) VALUES
('Form 47 Review and Validation', 'Complete review and validation of Consumer Proposal (Form 47)', 'Form 47', 'Section 66.13', 'compliance', 'high', 120, 
'[{"step": 1, "title": "Verify debtor information", "required": true}, {"step": 2, "title": "Review proposal terms", "required": true}, {"step": 3, "title": "Check creditor list completeness", "required": true}, {"step": 4, "title": "Validate payment schedule", "required": true}]',
'{"bia_compliance": true, "osb_approval": true, "creditor_notification": true}',
'{"filing_deadline": 30, "review_period": 45, "approval_deadline": 60}'),

('Form 31 Proof of Claim Analysis', 'Analyze and validate Proof of Claim submission', 'Form 31', 'Section 124', 'analysis', 'medium', 90,
'[{"step": 1, "title": "Verify creditor identity", "required": true}, {"step": 2, "title": "Validate claim amount", "required": true}, {"step": 3, "title": "Review supporting documentation", "required": true}, {"step": 4, "title": "Check statutory compliance", "required": true}]',
'{"proof_verification": true, "documentation_complete": true}',
'{"submission_deadline": 45, "review_period": 30}'),

('Form 65 Statement of Affairs Compliance', 'Complete compliance check for Statement of Affairs', 'Form 65', 'Section 158', 'compliance', 'high', 180,
'[{"step": 1, "title": "Verify asset valuations", "required": true}, {"step": 2, "title": "Cross-check liability amounts", "required": true}, {"step": 3, "title": "Validate related party transactions", "required": true}, {"step": 4, "title": "Confirm signature completeness", "required": true}]',
'{"trustee_review": true, "court_filing": true, "creditor_disclosure": true}',
'{"filing_deadline": 21, "court_submission": 30}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_ai_generated ON tasks(ai_generated);
CREATE INDEX IF NOT EXISTS idx_tasks_risk_id ON tasks(risk_id);
CREATE INDEX IF NOT EXISTS idx_tasks_form_number ON tasks(form_number);
CREATE INDEX IF NOT EXISTS idx_tasks_compliance_deadline ON tasks(compliance_deadline);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assigned_to ON task_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deadlines_task_id ON task_deadlines(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deadlines_deadline_date ON task_deadlines(deadline_date);

-- Create function to automatically assign tasks based on form type and user expertise
CREATE OR REPLACE FUNCTION assign_task_by_expertise(task_id UUID, form_number TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  assigned_user UUID;
BEGIN
  -- Simple assignment logic - can be enhanced with ML/AI later
  -- For now, assign based on form type patterns
  IF form_number LIKE 'Form 47%' OR form_number LIKE 'Form 66%' THEN
    -- Consumer proposal forms - assign to proposal specialists
    SELECT user_id INTO assigned_user 
    FROM user_roles 
    WHERE role = 'trustee' 
    LIMIT 1;
  ELSIF form_number LIKE 'Form 31%' OR form_number LIKE 'Form 32%' THEN
    -- Proof of claim forms - assign to claims specialists
    SELECT user_id INTO assigned_user 
    FROM user_roles 
    WHERE role = 'administrator' 
    LIMIT 1;
  ELSE
    -- Default assignment to available trustee
    SELECT user_id INTO assigned_user 
    FROM user_roles 
    WHERE role IN ('trustee', 'administrator') 
    LIMIT 1;
  END IF;
  
  -- Update the task with assignment
  IF assigned_user IS NOT NULL THEN
    UPDATE tasks 
    SET assigned_to = assigned_user, 
        auto_assigned = true 
    WHERE id = task_id;
    
    -- Create assignment record
    INSERT INTO task_assignments (task_id, assigned_to, assigned_by, notes)
    VALUES (task_id, assigned_user, assigned_user, 'Auto-assigned based on form type expertise');
  END IF;
  
  RETURN assigned_user;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update task updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_timestamp
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_timestamp();
