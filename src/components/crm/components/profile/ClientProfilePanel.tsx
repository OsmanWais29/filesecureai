
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClientInsightData } from "../../../activity/hooks/predictiveData/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Globe, User, Tag, FileText, Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClientProfilePanelProps {
  insights: ClientInsightData;
  clientName: string;
}

export const ClientProfilePanel = ({ insights, clientName }: ClientProfilePanelProps) => {
  // Extract initials from name
  const initials = clientName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Client Information</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={insights.clientProfile?.avatarUrl} alt={clientName} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-xl font-bold">{clientName}</h3>
            {insights.clientProfile?.company && (
              <p className="text-sm text-muted-foreground">{insights.clientProfile.company}</p>
            )}
            {insights.clientProfile?.role && (
              <p className="text-xs text-muted-foreground font-medium">{insights.clientProfile.role}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Contact Details</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm truncate">
                {insights.clientProfile?.email || "No email provided"}
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                {insights.clientProfile?.phone || "No phone provided"}
              </span>
            </div>
            
            {insights.clientProfile?.website && (
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Globe className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="text-sm truncate">{insights.clientProfile.website}</span>
              </div>
            )}
            
            {insights.clientProfile?.assignedAgent && (
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <User className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Assigned to: </span>
                  <span className="font-medium">{insights.clientProfile.assignedAgent}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags & Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Categories & Tags</h4>
          <div className="flex flex-wrap gap-2">
            {insights.clientProfile?.tags?.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs flex items-center gap-1 hover:bg-secondary/80 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {!insights.clientProfile?.tags?.length && (
              <p className="text-sm text-muted-foreground italic">No tags assigned</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {insights.clientProfile && 'leadDescription' in insights.clientProfile && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Case Information</h4>
            <div className="p-3 bg-muted/30 rounded-md">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm">{(insights.clientProfile as any).leadDescription}</p>
                  {'leadSource' in insights.clientProfile && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Source:</span> {(insights.clientProfile as any).leadSource}
                    </p>
                  )}
                  {'accountStatus' in insights.clientProfile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {(insights.clientProfile as any).accountStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};
