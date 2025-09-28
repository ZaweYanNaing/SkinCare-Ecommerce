import { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Search } from 'lucide-react';

interface Product {
  ProductID: number;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  ForSkinType: string;
  CategoryID: number;
  CategoryName: string;
  Image: string;
  Status: string;
}

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
}

function ProductEdit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    forSkinType: '',
    categoryId: '',
  });

  const skinTypes = ['Oily', 'Dry', 'Combination'];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost/admin/products.php');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.Name,
      description: product.Description,
      price: product.Price.toString(),
      stock: product.Stock.toString(),
      forSkinType: product.ForSkinType,
      categoryId: product.CategoryID.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch('http://localhost/admin/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.ProductID,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          forSkinType: formData.forSkinType,
          categoryId: parseInt(formData.categoryId),
          image: editingProduct.Image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const response = await fetch('http://localhost/admin/products.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Name.toLowerCase().includes(searchTerm.toLowerCase()) || product.CategoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || product.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MMK',
        minimumFractionDigits: 0,
      })
        .format(price)
        .replace('MMK', '') + ' MMK'
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6 hidden sm:block" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm sm:text-base">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Product</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage your skincare product inventory</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search products..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 w-full" 
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading products...</div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Image</th>
                    <th className="text-left p-3">Product Name</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Skin Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.ProductID} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {product.Image ? (
                            <img
                              src={`../../src/assets/${product.Image}`}
                              alt={product.Name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const nextDiv = target.nextElementSibling as HTMLElement;
                                if (nextDiv) nextDiv.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs text-gray-400 text-center p-2 ${product.Image ? 'hidden' : ''}`}>No Image</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{product.Name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.Description}</div>
                      </td>
                      <td className="p-3 font-medium">{formatPrice(product.Price)}</td>
                      <td className="p-3">{product.Stock}</td>
                      <td className="p-3">{product.CategoryName}</td>
                      <td className="p-3">{product.ForSkinType}</td>
                      <td className="p-3">
                        <Badge variant={product.Status === 'Active' ? 'default' : product.Status === 'Low Stock' ? 'secondary' : 'destructive'}>
                          {product.Status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product.ProductID, product.Name)}>
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
              {filteredProducts.map((product) => (
                <div key={product.ProductID} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  {/* Header with image and basic info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {product.Image ? (
                        <img
                          src={`../../src/assets/${product.Image}`}
                          alt={product.Name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextDiv = target.nextElementSibling as HTMLElement;
                            if (nextDiv) nextDiv.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`text-xs text-gray-400 text-center p-2 ${product.Image ? 'hidden' : ''}`}>No Image</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base mb-1">{product.Name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.Description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.Status === 'Active' ? 'default' : product.Status === 'Low Stock' ? 'secondary' : 'destructive'} className="text-xs">
                          {product.Status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium text-green-600">{formatPrice(product.Price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock</p>
                      <p className="font-medium">{product.Stock} units</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{product.CategoryName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Skin Type</p>
                      <p className="font-medium">{product.ForSkinType}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(product.ProductID, product.Name)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No products found matching your search.' : 'No products available.'}
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product information below.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (MMK)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Enter stock quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type</Label>
              <Select value={formData.forSkinType} onValueChange={(value) => setFormData({ ...formData, forSkinType: value })}>
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

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductEdit;
