
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ClientData } from "@/hooks/useClientManagement";
import { 
  MoreVertical, Search, Plus, Edit, Trash, 
  ArrowDown, ArrowUp, AlertCircle 
} from "lucide-react";

interface ClientListProps {
  clients: ClientData[];
  isLoading: boolean;
  onEdit: (client: ClientData) => void;
  onDelete: (client: ClientData) => void;
  onAdd: () => void;
  onClientSelect: (client: ClientData) => void;
}

export function ClientList({
  clients,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onClientSelect
}: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof ClientData>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [confirmDelete, setConfirmDelete] = useState<ClientData | null>(null);

  const handleSort = (field: keyof ClientData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const query = searchQuery.toLowerCase();
      return (
        client.name?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      // Handle date sorts
      if (sortField === 'last_interaction' || sortField === 'created_at') {
        const dateA = fieldA ? new Date(fieldA as string).getTime() : 0;
        const dateB = fieldB ? new Date(fieldB as string).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Handle numeric sorts
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }

      return 0;
    });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </div>
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Client {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('company')}>
                  <div className="flex items-center">
                    Company {getSortIcon('company')}
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('last_interaction')}>
                  <div className="flex items-center">
                    Last Activity {getSortIcon('last_interaction')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <TableRow 
                    key={client.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onClientSelect(client)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.email && <div>{client.email}</div>}
                        {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{formatDate(client.last_interaction)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEdit(client);
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(client);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>No clients match your search criteria</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>No clients found</p>
                        <Button variant="outline" onClick={onAdd} className="mt-2">
                          Add your first client
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {confirmDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirmDelete) {
                  onDelete(confirmDelete);
                  setConfirmDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
