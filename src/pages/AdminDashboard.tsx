import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import AdminQualityControl from '@/components/AdminQualityControl';

const AdminDashboard = () => {
  const [pendingProducts, setPendingProducts] = useState([
    {
      id: '1',
      name: 'Organic Wheat Seeds',
      farmer: 'Ravi Kumar',
      category: 'Seeds',
      price: 85,
      unit: 'kg',
      quantity: 200,
      submittedDate: '2024-06-23',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Fresh Mint Leaves',
      farmer: 'Priya Sharma',
      category: 'Herbs',
      price: 120,
      unit: 'kg',
      quantity: 50,
      submittedDate: '2024-06-24',
      image: 'https://images.unsplash.com/photo-1628556270448-4d37c113d4be?w=400',
      status: 'pending'
    }
  ]);

  const [dashboardStats] = useState({
    totalFarmers: 156,
    totalBuyers: 423,
    activeProducts: 234,
    pendingApprovals: 12,
    monthlyRevenue: 125600,
    totalOrders: 89
  });

  const handleApproveProduct = (productId: string) => {
    setPendingProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Product approved successfully!');
  };

  const handleRejectProduct = (productId: string) => {
    setPendingProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Product rejected and farmer notified.');
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the AgriDirect platform and ensure quality standards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalFarmers}</div>
              <p className="text-xs text-green-600">+12 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalBuyers}</div>
              <p className="text-xs text-green-600">+28 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeProducts}</div>
              <p className="text-xs text-green-600">+15 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">+18% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quality Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <Flag className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-800">5</div>
              <p className="text-sm text-yellow-700">Flagged Products</p>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-800">3</div>
              <p className="text-sm text-red-700">Refund Requests</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">24</div>
              <p className="text-sm text-green-700">Quality Badges</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">4.6</div>
              <p className="text-sm text-blue-700">Avg Platform Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals ({pendingProducts.length})
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Quality Control
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Products Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          by {product.farmer} • {product.category} • ₹{product.price}/{product.unit}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Quantity: {product.quantity} {product.unit}s</span>
                          <span>Submitted: {new Date(product.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveProduct(product.id)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectProduct(product.id)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p>All products have been reviewed!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <AdminQualityControl />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Farmers</span>
                      <span className="font-semibold">+12 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Buyers</span>
                      <span className="font-semibold">+28 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Products Listed</span>
                      <span className="font-semibold">+45 this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quality Score</span>
                      <span className="font-semibold text-green-600">4.6/5 ⭐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Refund Rate</span>
                      <span className="font-semibold text-green-600">2.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quality Badges</span>
                      <span className="font-semibold">24 active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-semibold">4.2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Ravi Kumar (Farmer)</p>
                      <p className="text-sm text-gray-600">Added 3 new products with videos</p>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Priya Sharma (Buyer)</p>
                      <p className="text-sm text-gray-600">Left 5-star review with photos</p>
                    </div>
                    <span className="text-xs text-gray-500">4 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Amit Singh (Farmer)</p>
                      <p className="text-sm text-gray-600">Earned Quality Assured badge</p>
                    </div>
                    <span className="text-xs text-gray-500">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
