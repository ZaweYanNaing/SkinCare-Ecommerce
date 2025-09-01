
import { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  forSkinType: string;
  categoryId: string;
  image: string;
}

function ProductCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    forSkinType: '',
    categoryId: '',
    image: ''
  });

  const skinTypes = ['Oily', 'Dry', 'Combination'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost/admin/categories.php');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: newCategoryName.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setIsNewCategoryDialogOpen(false);
        setNewCategoryName('');
        fetchCategories();
        // Auto-select the newly created category
        setFormData({...formData, categoryId: data.categoryId.toString()});
        toast.success('Category created successfully!');
      } else {
        toast.error('Failed to create category: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost/admin/upload-image.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.filename;
      } else {
        alert('Failed to upload image: ' + data.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }
    if (!formData.forSkinType) {
      alert('Please select a skin type');
      return;
    }
    if (!selectedFile) {
      alert('Please select an image for the product');
      return;
    }

    setLoading(true);
    
    try {
      // Upload image first
      const uploadedFilename = await uploadImage();
      if (!uploadedFilename) {
        setLoading(false);
        return;
      }

      // Create product with uploaded image filename
      const response = await fetch('http://localhost/admin/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          forSkinType: formData.forSkinType,
          categoryId: parseInt(formData.categoryId),
          image: uploadedFilename
        })
      });

      const data = await response.json();
      if (data.success) {
        toast('Product created successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          forSkinType: '',
          categoryId: '',
          image: ''
        });
        setSelectedFile(null);
        setImagePreview(null);
        
      } else {
        alert('Failed to create product: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/productEdit');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>Add a new skincare product to your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (MMK) *</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Enter price" 
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <div className="flex gap-2">
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                          {category.CategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                          Create a new product category.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCategory">Category Name</Label>
                          <Input
                            id="newCategory"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewCategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>
                          Create Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="Enter stock quantity" 
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type *</Label>
              <Select value={formData.forSkinType} onValueChange={(value) => setFormData({...formData, forSkinType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent>
                  {skinTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image *</Label>
              <Input 
                id="image" 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Upload a product image (JPG, PNG, GIF - Max 5MB)
              </p>
              
              {imagePreview && (
                <div className="mt-4">
                  <Label>Image Preview:</Label>
                  <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={loading || uploadingImage}
              >
                {loading ? 'Creating...' : uploadingImage ? 'Uploading...' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductCreate;