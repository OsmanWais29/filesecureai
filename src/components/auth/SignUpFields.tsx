
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Hash } from 'lucide-react';

interface SignUpFieldsProps {
  fullName: string;
  setFullName: (name: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

export const SignUpFields: React.FC<SignUpFieldsProps> = ({
  fullName,
  setFullName,
  userId,
  setUserId,
  avatarUrl,
  setAvatarUrl
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userId" className="text-sm font-medium">
          User ID
        </Label>
        <div className="relative">
          <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="userId"
            type="text"
            placeholder="Enter a unique user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
    </>
  );
};
