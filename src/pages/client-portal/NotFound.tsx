
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <button 
        className="bg-primary text-primary-foreground px-4 py-2 rounded"
        onClick={() => navigate("/client-portal")}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
