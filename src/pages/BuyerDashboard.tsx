
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Heart, Star, TrendingUp, MapPin } from "lucide-react";

const BuyerDashboard = () => {
  // Mock data for demonstration
  const recentOrders = [
    { id: "ORD-001", date: "2024-01-15", status: "Delivered", total: "$45.99", items: 3 },
    { id: "ORD-002", date: "2024-01-12", status: "In Transit", total: "$32.50", items: 2 },
    { id: "ORD-003", date: "2024-01-08", status: "Processing", total: "$78.25", items: 5 },
  ];

  const favoriteProducts = [
    { id: 1, name: "Organic Tomatoes", farmer: "Green Valley Farm", price: "$4.99/lb", rating: 4.8, location: "Maharashtra" },
    { id: 2, name: "Fresh Basil", farmer: "Herb Haven", price: "$2.50/bunch", rating: 4.9, location: "Karnataka" },
    { id: 3, name: "Free-Range Eggs", farmer: "Sunny Side Farm", price: "$6.99/dozen", rating: 4.7, location: "Punjab" },
  ];

  const recommendedProducts = [
    { id: 4, name: "Organic Spinach", farmer: "Green Fields", price: "$3.99/lb", rating: 4.8, discount: 15 },
    { id: 5, name: "Fresh Carrots", farmer: "Root Vegetables Co", price: "$2.99/lb", rating: 4.6, discount: 10 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "In Transit": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout userRole="buyer">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Priya!</h1>
          <p className="text-gray-600">Discover fresh produce from local farmers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,247.50</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Items in wishlist</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$156.75</div>
              <p className="text-xs text-green-600">Through deals & discounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <CardDescription>Your latest purchases from local farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.total}</p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Products */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recommended for You</CardTitle>
                <Button variant="outline" size="sm">See More</Button>
              </div>
              <CardDescription>Based on your preferences and order history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{product.name}</h4>
                          {product.discount && (
                            <Badge variant="destructive" className="text-xs">
                              {product.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{product.farmer}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{product.price}</p>
                      <Button size="sm" className="mt-1">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Favorite Products
            </CardTitle>
            <CardDescription>Quick access to your most loved items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.farmer}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {product.location}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium text-green-600">{product.price}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Browse Marketplace
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Track Orders
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Heart className="h-6 w-6 mb-2" />
                My Wishlist
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Star className="h-6 w-6 mb-2" />
                Rate Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
