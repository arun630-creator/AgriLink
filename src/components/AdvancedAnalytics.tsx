import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Package,
  IndianRupee,
  Star,
  MapPin,
  Clock
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    dailyData: Array<{ date: string; amount: number }>;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  users: {
    total: number;
    farmers: number;
    buyers: number;
    newThisMonth: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    pending: number;
    topCategories: Array<{ category: string; count: number; revenue: number }>;
  };
  quality: {
    averageRating: number;
    totalReviews: number;
    qualityFlags: number;
    resolutionRate: number;
  };
  regional: {
    topRegions: Array<{ region: string; orders: number; revenue: number }>;
    deliveryPerformance: Array<{ region: string; avgDeliveryTime: number; satisfaction: number }>;
  };
}

const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch comprehensive analytics data
      const [revenueRes, ordersRes, usersRes, productsRes, qualityRes, regionalRes] = await Promise.all([
        apiService.get(`/admin/analytics/revenue?period=${timeRange}`),
        apiService.get(`/admin/analytics/orders?period=${timeRange}`),
        apiService.get(`/admin/analytics/users?period=${timeRange}`),
        apiService.get(`/admin/analytics/products?period=${timeRange}`),
        apiService.get(`/admin/analytics/quality?period=${timeRange}`),
        apiService.get(`/admin/analytics/regional?period=${timeRange}`)
      ]);

      const data: AnalyticsData = {
        revenue: revenueRes.success ? revenueRes.data : {
          total: 0, thisMonth: 0, lastMonth: 0, growth: 0, dailyData: []
        },
        orders: ordersRes.success ? ordersRes.data : {
          total: 0, thisMonth: 0, lastMonth: 0, growth: 0, statusDistribution: []
        },
        users: usersRes.success ? usersRes.data : {
          total: 0, farmers: 0, buyers: 0, newThisMonth: 0, growth: 0
        },
        products: productsRes.success ? productsRes.data : {
          total: 0, active: 0, pending: 0, topCategories: []
        },
        quality: qualityRes.success ? qualityRes.data : {
          averageRating: 0, totalReviews: 0, qualityFlags: 0, resolutionRate: 0
        },
        regional: regionalRes.success ? regionalRes.data : {
          topRegions: [], deliveryPerformance: []
        }
      };

      setAnalyticsData(data);

      if (isRefresh) {
        // Show success toast
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    // Implement export functionality
    console.log(`Exporting ${type} report...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalyticsData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData.revenue.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.revenue.growth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              {Math.abs(analyticsData.revenue.growth)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.orders.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.orders.growth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              {Math.abs(analyticsData.orders.growth)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.users.growth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              {Math.abs(analyticsData.users.growth)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.quality.averageRating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">
              Based on {analyticsData.quality.totalReviews} reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue chart will be implemented here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Category revenue chart will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.orders.statusDistribution.map((status) => (
                    <div key={status.status} className="flex justify-between items-center">
                      <span className="text-sm">{status.status}</span>
                      <Badge variant="secondary">{status.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Order timeline chart will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Farmers</span>
                    <Badge variant="outline">{analyticsData.users.farmers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Buyers</span>
                    <Badge variant="outline">{analyticsData.users.buyers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>New This Month</span>
                    <Badge variant="secondary">{analyticsData.users.newThisMonth}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  User activity chart will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.products.topCategories.map((category) => (
                    <div key={category.category} className="flex justify-between items-center">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{category.count}</Badge>
                        <Badge variant="secondary">₹{category.revenue}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Product performance chart will be implemented here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.regional.topRegions.map((region) => (
                    <div key={region.region} className="flex justify-between items-center">
                      <span className="text-sm">{region.region}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{region.orders} orders</Badge>
                        <Badge variant="secondary">₹{region.revenue}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.regional.deliveryPerformance.map((region) => (
                    <div key={region.region} className="flex justify-between items-center">
                      <span className="text-sm">{region.region}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{region.avgDeliveryTime}h avg</Badge>
                        <Badge variant="secondary">{region.satisfaction}% satisfaction</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics; 