import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Shield, Plus, Edit, Trash2 } from 'lucide-react';

interface Admin {
  AdminID: number;
  Type: string;
  Email: string;
  RoleDescription?: string;
  CreatedDate: string;
  LastLogin: string;
}

interface AdminFormData {
  type: string;
  email: string;
  password: string;
}

function AdminAccounts() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    type: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost/admin/admin-accounts.php');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!formData.type.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/admin-accounts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsCreateDialogOpen(false);
        setFormData({ type: '', email: '', password: '' });
        fetchAdmins();
        alert('Admin account created successfully!');
      } else {
        alert('Failed to create admin: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin account');
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      type: admin.Type,
      email: admin.Email,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    
    if (!formData.type.trim() || !formData.email.trim()) {
      alert('Please fill in type and email fields');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/admin-accounts.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.AdminID,
          type: formData.type.trim(),
          email: formData.email.trim(),
          password: formData.password || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsEditDialogOpen(false);
        setEditingAdmin(null);
        setFormData({ type: '', email: '', password: '' });
        fetchAdmins();
        alert('Admin account updated successfully!');
      } else {
        alert('Failed to update admin: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin account');
    }
  };

  const handleDeleteAdmin = async (adminId: number, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminEmail}"?`)) return;

    try {
      const response = await fetch('http://localhost/admin/admin-accounts.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId })
      });

      const data = await response.json();
      if (data.success) {
        fetchAdmins();
        alert('Admin account deleted successfully!');
      } else {
        alert('Failed to delete admin: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin account');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.Type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6 hidden sm:block" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm sm:text-base">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/accManange">Account Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Admin Accounts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-xl sm:text-2xl font-bold">{admins.length}</p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {admins.filter(a => a.Type.toLowerCase().includes('super')).length}
                </p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Regular Admins</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {admins.filter(a => !a.Type.toLowerCase().includes('super')).length}
                </p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Accounts
              </CardTitle>
              <CardDescription>Manage administrator accounts and permissions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>
                      Add a new administrator account to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Admin Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select admin type...</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
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
                    <Button onClick={handleCreateAdmin}>
                      Create Admin
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading admin accounts...</div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Admin Info</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Created Date</th>
                      <th className="text-left p-3">Last Login</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.AdminID} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">Admin #{admin.AdminID}</div>
                            <div className="text-sm text-gray-500">ID: {admin.AdminID}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            admin.Type.toLowerCase().includes('super') ? 'destructive' : 
                            admin.Type === 'Expert' ? 'secondary' : 'default'
                          }>
                            {admin.Type}
                          </Badge>
                          {admin.Type === 'Expert' && admin.RoleDescription && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                              {admin.RoleDescription}
                            </div>
                          )}
                        </td>
                        <td className="p-3">{admin.Email}</td>
                        <td className="p-3 text-sm text-gray-500">
                          {formatDate(admin.CreatedDate)}
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {formatDate(admin.LastLogin)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteAdmin(admin.AdminID, admin.Email)}
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
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredAdmins.map((admin) => (
                  <div key={admin.AdminID} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    {/* Header with admin info and type */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-base">Admin #{admin.AdminID}</h3>
                        <p className="text-sm text-gray-500">ID: {admin.AdminID}</p>
                      </div>
                      <Badge variant={
                        admin.Type.toLowerCase().includes('super') ? 'destructive' : 
                        admin.Type === 'Expert' ? 'secondary' : 'default'
                      }>
                        {admin.Type}
                      </Badge>
                    </div>

                    {/* Admin details */}
                    <div className="space-y-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium break-all">{admin.Email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-medium">{formatDate(admin.CreatedDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Login</p>
                          <p className="font-medium">{formatDate(admin.LastLogin)}</p>
                        </div>
                      </div>
                      {admin.Type === 'Expert' && admin.RoleDescription && (
                        <div>
                          <p className="text-gray-500">Role Description</p>
                          <p className="font-medium">{admin.RoleDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAdmin(admin)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.AdminID, admin.Email)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredAdmins.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No admin accounts found matching your search.' : 'No admin accounts available.'}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Account</DialogTitle>
            <DialogDescription>
              Update administrator account information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editType">Admin Type</Label>
              <select
                id="editType"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select admin type...</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="admin@example.com"
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
            <Button onClick={handleUpdateAdmin}>
              Update Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminAccounts;