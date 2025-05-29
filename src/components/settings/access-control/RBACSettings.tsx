
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Shield, MapPin } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Global Admin' | 'Multi-Province Trustee' | 'Regional Trustee' | 'Case Administrator' | 'Reviewer' | 'Client';
  provinces: string[];
  ipWhitelisted: boolean;
  whitelistedIPs: string[];
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending';
}

export const RBACSettings = () => {
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('Client');
  const [newUserProvinces, setNewUserProvinces] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');

  // Mock user data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane.smith@trustee.com',
      role: 'Global Admin',
      provinces: ['All'],
      ipWhitelisted: true,
      whitelistedIPs: ['192.168.1.100', '10.0.0.5'],
      lastLogin: '2023-08-10T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Robert Johnson',
      email: 'robert.johnson@trustee.com',
      role: 'Multi-Province Trustee',
      provinces: ['Ontario', 'Quebec', 'British Columbia'],
      ipWhitelisted: true,
      whitelistedIPs: ['192.168.1.101'],
      lastLogin: '2023-08-10T13:15:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@trustee.com',
      role: 'Regional Trustee',
      provinces: ['Quebec'],
      ipWhitelisted: false,
      whitelistedIPs: [],
      lastLogin: '2023-08-09T16:45:00Z',
      status: 'active'
    },
    {
      id: '4',
      name: 'David Lee',
      email: 'david.lee@trustee.com',
      role: 'Case Administrator',
      provinces: ['Ontario'],
      ipWhitelisted: true,
      whitelistedIPs: ['192.168.1.103'],
      lastLogin: '2023-08-09T11:20:00Z',
      status: 'suspended'
    }
  ]);

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 
    'Saskatchewan', 'Yukon'
  ];

  const addUser = () => {
    if (!newUserName || !newUserEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      provinces: newUserRole === 'Global Admin' ? ['All'] : newUserProvinces,
      ipWhitelisted: false,
      whitelistedIPs: [],
      lastLogin: 'Never',
      status: 'pending'
    };

    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Client');
    setNewUserProvinces([]);
    toast.success("User added successfully");
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User removed successfully");
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    toast.success(`User status updated to ${status}`);
  };

  const addIPToWhitelist = (userId: string) => {
    if (!newIpAddress) {
      toast.error("Please enter an IP address");
      return;
    }

    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            whitelistedIPs: [...user.whitelistedIPs, newIpAddress],
            ipWhitelisted: true
          } 
        : user
    ));
    setNewIpAddress('');
    toast.success("IP address added to whitelist");
  };

  const removeIPFromWhitelist = (userId: string, ipToRemove: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            whitelistedIPs: user.whitelistedIPs.filter(ip => ip !== ipToRemove)
          } 
        : user
    ));
    toast.success("IP address removed from whitelist");
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'Global Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Multi-Province Trustee': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Regional Trustee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Case Administrator': return 'bg-green-100 text-green-800 border-green-200';
      case 'Reviewer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Client': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* IP Whitelisting Global Settings */}
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              IP Address Whitelisting
            </h3>
            <p className="text-sm text-muted-foreground">
              Control access based on IP addresses for enhanced security
            </p>
          </div>
          <Switch
            checked={ipWhitelistEnabled}
            onCheckedChange={setIpWhitelistEnabled}
          />
        </div>
        
        {ipWhitelistEnabled && (
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
            <strong>Warning:</strong> IP whitelisting is enabled. Users not on the whitelist will be denied access.
          </div>
        )}
      </div>

      {/* Add New User */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New User
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="newUserName">Full Name</Label>
            <Input
              id="newUserName"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <Label htmlFor="newUserEmail">Email</Label>
            <Input
              id="newUserEmail"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="newUserRole">Role</Label>
            <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as User['role'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global Admin">Global Admin</SelectItem>
                <SelectItem value="Multi-Province Trustee">Multi-Province Trustee</SelectItem>
                <SelectItem value="Regional Trustee">Regional Trustee</SelectItem>
                <SelectItem value="Case Administrator">Case Administrator</SelectItem>
                <SelectItem value="Reviewer">Reviewer</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={addUser} className="w-full">
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Provinces</TableHead>
              <TableHead>IP Whitelist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {user.provinces.includes('All') ? 'All Provinces' : user.provinces.join(', ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {user.ipWhitelisted ? (
                      <div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Enabled
                        </Badge>
                        <div className="mt-1 space-y-1">
                          {user.whitelistedIPs.map((ip, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{ip}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIPFromWhitelist(user.id, ip)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="IP address"
                              value={newIpAddress}
                              onChange={(e) => setNewIpAddress(e.target.value)}
                              className="h-6 text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addIPToWhitelist(user.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select 
                    value={user.status} 
                    onValueChange={(value) => updateUserStatus(user.id, value as User['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
