
import { MainLayout } from "@/components/layout/MainLayout";
import { NewTicketForm } from "@/components/support/NewTicketForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

const NewSupportTicket = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/support")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
          <h1 className="text-3xl font-bold">Create Support Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Describe your issue and we'll connect you with the right support
          </p>
        </div>
        
        <NewTicketForm />
        <Toaster position="bottom-right" />
      </div>
    </MainLayout>
  );
};

export default NewSupportTicket;
