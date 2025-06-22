
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logger from "@/utils/logger";
import { BookingLinkForm } from "./BookingLinkForm";
import { GeneratedLinkDisplay } from "./GeneratedLinkDisplay";
import { EmptyLinkState } from "./EmptyLinkState";
import { toast } from "sonner";

export const GenerateBookingLink = () => {
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [caseType, setCaseType] = useState("Consumer Proposal");
  const [caseNumber, setCaseNumber] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Generate a booking request link with unique token 
  const generateBookingLink = () => {
    // Create a unique token or ID for this booking request
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // In a real implementation, this should be stored in the database
    const link = `${window.location.origin}/booking-request/${token}`;
    setGeneratedLink(link);
    
    logger.info("Generated booking link:", link);
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard");
  };
  
  // Send booking email to client
  const sendBookingEmail = async () => {
    if (!clientEmail || !clientName) {
      toast.error("Please enter client email and name");
      return;
    }
    
    try {
      setIsSending(true);
      
      // In a real implementation, this would call an Edge Function to send the email
      // For now, we'll simulate sending the email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`An email with booking instructions has been sent to ${clientName} at ${clientEmail}`);
      
      logger.info(`Sent booking email to: ${clientEmail} for case: ${caseNumber}`);
      
      // Reset form
      setClientEmail("");
      setClientName("");
      setCaseNumber("");
      setAdditionalNotes("");
      setGeneratedLink("");
      
    } catch (error) {
      logger.error("Error sending booking email:", error);
      toast.error("Failed to send booking email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <BookingLinkForm
          clientName={clientName}
          setClientName={setClientName}
          clientEmail={clientEmail}
          setClientEmail={setClientEmail}
          caseType={caseType}
          setCaseType={setCaseType}
          caseNumber={caseNumber}
          setCaseNumber={setCaseNumber}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
        />
        
        <div className="flex space-x-2">
          <Button onClick={generateBookingLink} className="flex-1">
            Generate Booking Link
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {generatedLink ? (
          <GeneratedLinkDisplay
            generatedLink={generatedLink}
            clientName={clientName}
            clientEmail={clientEmail}
            caseType={caseType}
            isSending={isSending}
            handleCopyLink={copyLinkToClipboard}
            handleSendEmail={sendBookingEmail}
          />
        ) : (
          <EmptyLinkState />
        )}
      </div>
    </div>
  );
};
