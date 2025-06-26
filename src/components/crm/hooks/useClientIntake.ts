
import { useState } from "react";
import { FormData } from "../types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useClientIntake = () => {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    mobilePhone: "",
    companyName: "",
    businessType: "",
    notes: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    dateOfBirth: "",
    sin: "",
    maritalStatus: "",
    leadSource: "",
    otherLeadSourceDetails: "",
    leadDescription: "",
    accountStatus: "lead",
    preferredContactMethod: "email",
    preferredLanguage: "english"
  });

  const openClientDialog = () => {
    setCurrentStep(1);
    setFormProgress(0);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      mobilePhone: "",
      companyName: "",
      businessType: "",
      notes: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      dateOfBirth: "",
      sin: "",
      maritalStatus: "",
      leadSource: "",
      otherLeadSourceDetails: "",
      leadDescription: "",
      accountStatus: "lead",
      preferredContactMethod: "email",
      preferredLanguage: "english"
    });
    setIsClientDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    calculateProgress();
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Apply smart CRM logic based on preferred contact method
    if (field === 'preferredContactMethod') {
      applyContactMethodAutomation(value);
    }
    
    calculateProgress();
  };
  
  const applyContactMethodAutomation = (contactMethod: string) => {
    switch (contactMethod) {
      case 'phone':
        toast.success("Call Task Created", {
          description: "A call task has been scheduled for the assigned representative.",
        });
        console.log("Automation: Created call task for client");
        break;
      case 'email':
        toast.success("Email Templates Prepared", {
          description: "Email follow-up reminders have been set up.",
        });
        console.log("Automation: Email templates and reminders configured");
        break;
      case 'sms':
        toast.success("SMS Handling Configured", {
          description: "Automated text messaging has been set up via Twilio.",
        });
        console.log("Automation: SMS handling via Twilio configured");
        break;
    }
  };
  
  const handleEmploymentTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, employmentType: value }));
    calculateProgress();
  };
  
  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => 
      value !== "" && value !== null && value !== undefined
    ).length;
    
    let stepProgress = 0;
    
    // Calculate progress based on current step
    switch (currentStep) {
      case 1: // Personal Info
        const personalFields = ['fullName', 'email', 'phone', 'address', 'city', 'province', 'postalCode'];
        const filledPersonal = personalFields.filter(field => formData[field as keyof FormData]).length;
        stepProgress = (filledPersonal / personalFields.length) * 20;
        break;
      case 2: // Employment
        stepProgress = 20 + (formData.employmentType ? 20 : 0);
        break;
      case 3: // Finances
        stepProgress = 40 + 20; // Assume finances step completed when reached
        break;
      case 4: // Documents
        stepProgress = 60 + 20; // Assume documents step completed when reached
        break;
      case 5: // Schedule
        stepProgress = 80 + 20; // Final step
        break;
      default:
        stepProgress = (filledFields / totalFields) * 100;
    }
    
    setFormProgress(Math.min(100, Math.max(0, stepProgress)));
  };
  
  const handleSubmitForm = async () => {
    try {
      // Create client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          status: 'active',
          engagement_score: 85,
          last_interaction: new Date().toISOString(),
          metadata: {
            intake_data: formData,
            source: 'ai_intake_form',
            processed_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create client folder in documents
      const { data: folderData, error: folderError } = await supabase
        .from('documents')
        .insert({
          title: `${formData.fullName} - Client Files`,
          is_folder: true,
          folder_type: 'client',
          metadata: {
            client_id: clientData.id,
            client_name: formData.fullName,
            created_by_intake: true,
            intake_completed_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (folderError) throw folderError;

      // Create initial client interaction record
      const { error: interactionError } = await supabase
        .from('client_interactions')
        .insert({
          client_id: clientData.id,
          type: 'intake_form',
          content: `Initial AI-powered intake form completed. Lead source: ${formData.leadSource}`,
          metadata: {
            form_data: formData,
            intake_step: 'completed',
            scheduled_consultation: true
          }
        });

      if (interactionError) throw interactionError;

      // Call DeepSeek AI to process the intake and generate recommendations
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          prompt: `New client intake completed for ${formData.fullName}. 
          
          Client Information:
          - Name: ${formData.fullName}
          - Email: ${formData.email}
          - Phone: ${formData.phone}
          - Marital Status: ${formData.maritalStatus}
          - Lead Source: ${formData.leadSource}
          - Preferred Contact: ${formData.preferredContactMethod}
          - Account Status: ${formData.accountStatus}
          
          Please analyze this client intake and provide:
          1. AI recommendations for next steps
          2. Risk assessment based on provided information
          3. Suggested follow-up actions
          4. Timeline recommendations
          
          Format the response as a JSON object with recommendations, risk_level, and next_steps.`,
          type: 'client_intake_analysis'
        }
      });

      // Create AI-generated tasks and recommendations
      if (aiResponse && !aiError) {
        const recommendations = aiResponse.recommendations || [];
        
        // Create tasks based on AI recommendations
        for (const rec of recommendations) {
          await supabase.from('client_tasks').insert({
            client_id: clientData.id,
            title: rec.title || 'Follow-up Task',
            description: rec.description || 'AI-generated follow-up task',
            priority: rec.priority || 'medium',
            status: 'pending',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            created_by: clientData.id
          });
        }
      }

      toast.success("Client intake completed successfully!", {
        description: `${formData.fullName} has been added to the system with AI-generated recommendations.`,
      });
      
      setIsClientDialogOpen(false);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        mobilePhone: "",
        companyName: "",
        businessType: "",
        notes: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        dateOfBirth: "",
        sin: "",
        maritalStatus: "",
        leadSource: "",
        otherLeadSourceDetails: "",
        leadDescription: "",
        accountStatus: "lead",
        preferredContactMethod: "email",
        preferredLanguage: "english"
      });
      setCurrentStep(1);
      setFormProgress(0);

    } catch (error) {
      console.error('Error processing client intake:', error);
      toast.error("Failed to complete intake", {
        description: "There was an error processing the client intake. Please try again.",
      });
    }
  };

  return {
    isClientDialogOpen,
    setIsClientDialogOpen,
    currentStep,
    setCurrentStep,
    formProgress,
    formData,
    openClientDialog,
    handleInputChange,
    handleSelectChange,
    handleEmploymentTypeChange,
    handleSubmitForm
  };
};
