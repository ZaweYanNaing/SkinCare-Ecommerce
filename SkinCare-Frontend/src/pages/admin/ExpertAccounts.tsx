import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, User, Plus, Edit, Trash2 } from 'lucide-react';

interface Expert {
  ExpertID: number;
  Name: string;
  Email: string;
  Specialization: string;
  Bio: string;
  Status: 'active' | 'busy' | 'offline';
  CreatedAt?: string;
}

interface ExpertFormData {
  name: string;
  email: string;
  specialization: string;
  bio: string;
  password: string;
}

function ExpertAccounts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [formData, setFormData] = useState<ExpertFormData>({
    name: '',
    email: '',
    specialization: '',
    bio: '',
    password: ''
  });

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const response = await fetch('http://localhost/admin/expert-accounts.php');
      const data = await response.json();
      if (data.success) {
        setExperts(data.data);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };  const
 handleCreateExpert = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.specialization.trim() || !formData.password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/expert-accounts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          specialization: formData.specialization.trim(),
          bio: formData.bio.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsCreateDialogOpen(false);
        setFormData({ name: '', email: '', specialization: '', bio: '', password: '' });
        fetchExperts();
        alert('Expert account created successfully!');
      } else {
        alert('Failed to create expert: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating expert:', error);
      alert('Error creating expert account');
    }
  };

  const handleEditExpert = (expert: Expert) => {
    setEditingExpert(expert);
    setFormData({
      name: expert.Name,
      email: expert.Email,
      specialization: expert.Specialization,
      bio: expert.Bio,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateExpert = async () => {
    if (!editingExpert) return;
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.specialization.trim()) {
      alert('Please fill in name, email, and specialization fields');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/expert-accounts.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExpert.ExpertID,
          name: formData.name.trim(),
          email: formData.email.trim(),
          specialization: formData.specialization.trim(),
          bio: formData.bio.trim(),
          password: formData.password || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsEditDialogOpen(false);
        setEditingExpert(null);
        setFormData({ name: '', email: '', specialization: '', bio: '', password: '' });
        fetchExperts();
        alert('Expert account updated successfully!');
      } else {
        alert('Failed to update expert: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating expert:', error);
      alert('Error updating expert account');
    }
  };

  const handleDeleteExpert = async (expertId: number, expertName: string) => {
    if (!confirm(`Are you sure you want to delete expert "${expertName}"?`)) return;

    try {
      const response = await fetch('http://localhost/admin/expert-accounts.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expertId })
      });

      const data = await response.json();
      if (data.success) {
        fetchExperts();
        alert('Expert account deleted successfully!');
      } else {
        alert('Failed to delete expert: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting expert:', error);
      alert('Error deleting expert account');
    }
  };

  const filteredExperts = experts.filter(expert =>
    expert.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.Specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/accManange">Account Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Expert Accounts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div> 
     {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Experts</p>
                <p className="text-2xl font-bold">{experts.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Experts</p>
                <p className="text-2xl font-bold text-green-600">
                  {experts.filter(e => e.Status === 'active').length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Busy Experts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {experts.filter(e => e.Status === 'busy').length}
                </p>
              </div>
              <User className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline Experts</p>
                <p className="text-2xl font-bold text-gray-600">
                  {experts.filter(e => e.Status === 'offline').length}
                </p>
              </div>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Expert Accounts
              </CardTitle>
              <CardDescription>Manage expert accounts and their information</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search experts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expert
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Expert</DialogTitle>
                    <DialogDescription>
                      Add a new expert account to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Expert name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="expert@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Dermatology, Anti-aging"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Expert bio and experience..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateExpert}>
                      Create Expert
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>        <
CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading expert accounts...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Expert Info</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Specialization</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExperts.map((expert) => (
                    <tr key={expert.ExpertID} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{expert.Name}</div>
                          <div className="text-sm text-gray-500">ID: {expert.ExpertID}</div>
                          {expert.Bio && (
                            <div className="text-xs text-gray-400 mt-1 max-w-48 truncate">
                              {expert.Bio}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{expert.Email}</td>
                      <td className="p-3">
                        <Badge variant="outline">{expert.Specialization}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          expert.Status === 'active' ? 'default' : 
                          expert.Status === 'busy' ? 'secondary' : 'destructive'
                        }>
                          {expert.Status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditExpert(expert)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteExpert(expert.ExpertID, expert.Name)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredExperts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No expert accounts found matching your search.' : 'No expert accounts available.'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Expert Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expert Account</DialogTitle>
            <DialogDescription>
              Update expert account information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Expert name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="expert@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSpecialization">Specialization *</Label>
              <Input
                id="editSpecialization"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                placeholder="e.g., Dermatology, Anti-aging"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBio">Bio</Label>
              <textarea
                id="editBio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Expert bio and experience..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password (optional)</Label>
              <Input
                id="editPassword"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Leave empty to keep current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpert}>
              Update Expert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExpertAccounts;