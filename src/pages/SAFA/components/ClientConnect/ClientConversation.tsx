
import { ChatMessage as ChatMessageType } from "../../types";
import { ConversationView } from "../ConversationView";

interface ClientConversationProps {
  messages: ChatMessageType[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isProcessing: boolean;
}

export const ClientConversation = ({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isProcessing
}: ClientConversationProps) => {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <ConversationView
        messages={messages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    </div>
  );
};
