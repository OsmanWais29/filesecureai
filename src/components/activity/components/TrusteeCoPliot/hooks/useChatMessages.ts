
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatMessages() {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(23);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi there! I'm your TrusteeCo-Pilot. Let's get started on your monthly Form 65. What was your source of income this month?" },
  ]);
  const { toast } = useToast();

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      toast({
        title: "Microphone active",
        description: "Listening for your response...",
      });
      
      // Simulate microphone access
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Microphone accessed");
          // Simulate voice recognition after a delay
          setTimeout(() => {
            addMessage("user", "I received my regular salary plus some cash from a side job.");
            setTimeout(() => {
              addMessage("assistant", "Thank you. For your regular salary, could you upload a paystub? For the side job income, we'll need to document this carefully. Can you tell me approximately how much you earned from your side job?");
              setIsRecording(false);
            }, 1000);
          }, 2000);
        })
        .catch(err => {
          console.error("Error accessing microphone:", err);
          addMessage("assistant", "I couldn't access your microphone. You can type your response instead.");
          setIsRecording(false);
          toast({
            variant: "destructive",
            title: "Microphone error",
            description: "Could not access your microphone. Please check permissions.",
          });
        });
    } else {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "Microphone disabled",
        description: "Voice recording stopped.",
      });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      addMessage("user", message);
      setMessage("");
      
      // Simulate progress increment
      setCompletionPercentage(prev => Math.min(prev + 5, 100));
      
      // Simulate AI response
      setTimeout(() => {
        if (message.toLowerCase().includes("paystub") || message.toLowerCase().includes("upload")) {
          addMessage("assistant", "Thank you for providing that information. I've made a note to verify the paystub when you upload it.");
          setCompletionPercentage(Math.min(completionPercentage + 10, 100));
        } else if (message.toLowerCase().includes("$")) {
          addMessage("assistant", "I've noted that amount. Could you provide any documentation for this income? If not, we'll need to create an exception memo explaining why.");
          setCompletionPercentage(Math.min(completionPercentage + 10, 100));
        } else {
          addMessage("assistant", "I understand. Let's continue with your income verification. Did you receive any government benefits this month?");
        }
      }, 1000);
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    setChatMessages(prev => [...prev, { role, content }]);
  };

  return {
    isRecording,
    message,
    setMessage,
    chatMessages,
    completionPercentage,
    toggleRecording,
    handleSendMessage
  };
}
