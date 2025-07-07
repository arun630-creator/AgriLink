
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const ManageProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - replace with actual API data
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 45,
      unit: 'kg',
      quantity: 150,
      status: 'active',
      orders: 23,
      revenue: 10350,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
      harvestDate: '2024-06-20',
      createdDate: '2024-06-21'
    },
    {
      id: '2',
      name: 'Fresh Spinach',
      category: 'Vegetables',
      price: 30,
      unit: 'kg',
      quantity: 0,
      status: 'out_of_stock',
      orders: 15,
      revenue: 4500,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
      harvestDate: '2024-06-18',
      createdDate: '2024-06-19'
    },
    {
      id: '3',
      name: 'Wheat Seeds',
      category: 'Seeds',
      price: 85,
      unit: 'kg',
      quantity: 200,
      status: 'pending_approval',
      orders: 0,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      harvestDate: '2024-06-22',
      createdDate: '2024-06-23'
    },
    {
      id: '4',
      name: 'Organic Carrots',
      category: 'Vegetables',
      price: 35,
      unit: 'kg',
      quantity: 80,
      status: 'active',
      orders: 12,
      revenue: 4200,
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400',
      harvestDate: '2024-06-19',
      createdDate: '2024-06-20'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'out_of_stock':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Product deleted successfully');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout userRole="farmer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600">Oversee your product listings and inventory</p>
          </div>
          <Link to="/farmer/add-product">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {products.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.status === 'out_of_stock').length}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.status === 'pending_approval').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {product.category} • ₹{product.price}/{product.unit}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Stock: {product.quantity} {product.unit}s</span>
                      <span>Orders: {product.orders}</span>
                      <span>Revenue: ₹{product.revenue.toLocaleString()}</span>
                      <span>Listed: {new Date(product.createdDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Mark Out of Stock</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageProducts;
