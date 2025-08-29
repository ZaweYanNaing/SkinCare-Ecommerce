import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function ProductEdit() {
  const products = [
    {
      id: 1,
      name: 'Hydrating Toner',
      price: '$29.99',
      stock: 45,
      category: 'Toner',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Cleansing Serum',
      price: '$39.99',
      stock: 23,
      category: 'Serum',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Anti-Aging Scrub',
      price: '$34.99',
      stock: 12,
      category: 'Scrub',
      status: 'Low Stock'
    },
    {
      id: 4,
      name: 'Moisturizing Cream',
      price: '$44.99',
      stock: 0,
      category: 'Cream',
      status: 'Out of Stock'
    }
  ];

  return (
    <div className="my-5.5 min-w-275">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
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
          <CardTitle>Product Management</CardTitle>
          <CardDescription>Manage your skincare product inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Product Name</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">{product.price}</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          product.status === 'Active' ? 'default' : 
                          product.status === 'Low Stock' ? 'secondary' : 'destructive'
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductEdit;