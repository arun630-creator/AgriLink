
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Phone, MessageSquare } from "lucide-react";

const Order = () => {
  const quickOrderCategories = [
    { id: "vegetables", name: "Vegetables", icon: "🥬" },
    { id: "fruits", name: "Fruits", icon: "🍎" },
    { id: "grains", name: "Grains", icon: "🌾" },
    { id: "dairy", name: "Dairy", icon: "🥛" },
    { id: "herbs", name: "Herbs", icon: "🌿" },
    { id: "seeds", name: "Seeds", icon: "🌰" }
  ];

  const popularItems = [
    { name: "Organic Tomatoes", price: "₹45/kg", farmer: "Green Valley Farm" },
    { name: "Fresh Spinach", price: "₹30/kg", farmer: "Leafy Greens Co" },
    { name: "Basmati Rice", price: "₹85/kg", farmer: "Golden Fields" },
    { name: "Farm Fresh Milk", price: "₹60/L", farmer: "Dairy Direct" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🛒 Place Your Order</h1>
          <p className="text-xl text-gray-600">
            Quick and easy ordering from local farmers - fresh produce delivered to your door
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search for products, farmers, or categories..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Quick Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {quickOrderCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Order Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Custom Order Request</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <Input placeholder="e.g., Organic Tomatoes" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex gap-2">
                        <Input placeholder="Amount" className="flex-1" />
                        <Select>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="gram">gram</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                            <SelectItem value="box">box</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Location
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="any">Any Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Date
                      </label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requirements
                    </label>
                    <Textarea 
                      placeholder="Any special requirements, quality preferences, or additional notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Submit Order Request
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Save as Draft
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Items */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg">🔥 Popular This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.farmer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 text-sm">{item.price}</p>
                        <Button size="sm" className="text-xs">Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Help */}
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg">💬 Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Call Support</p>
                    <p className="text-xs text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Live Chat</p>
                    <p className="text-xs text-gray-600">Available 9 AM - 6 PM</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Order Benefits */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 space-y-2">
                <h4 className="font-semibold text-green-800">✅ Order Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Direct from farmers</li>
                  <li>• Fresh produce guarantee</li>
                  <li>• Competitive pricing</li>
                  <li>• Free delivery on ₹500+</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
