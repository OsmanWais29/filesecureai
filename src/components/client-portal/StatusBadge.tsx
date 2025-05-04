
import { cn } from "@/lib/utils";

type StatusType = 
  | "Draft"
  | "Filed"
  | "Under Review"
  | "Awaiting Approval"
  | "Active"
  | "Risk Flagged"
  | "Overdue"
  | "Completed"
  | "Discharged"
  | "Rejected"
  | "Complete"
  | "Incomplete";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge = ({ status, size = "md", className }: StatusBadgeProps) => {
  // Define status colors and styles
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "filed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "under review":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "awaiting approval":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "risk flagged":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
      case "complete":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "discharged":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "incomplete":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1.5"
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium",
      getStatusStyles(status),
      sizeClasses[size],
      className
    )}>
      {status}
    </span>
  );
};
