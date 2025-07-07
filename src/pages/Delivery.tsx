
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle } from "lucide-react";

const Delivery = () => {
  const deliveryZones = [
    { zone: "Zone A", cities: ["Mumbai", "Pune", "Nashik"], time: "Same Day", fee: "Free" },
    { zone: "Zone B", cities: ["Delhi", "Gurgaon", "Noida"], time: "Next Day", fee: "₹50" },
    { zone: "Zone C", cities: ["Bangalore", "Chennai", "Hyderabad"], time: "1-2 Days", fee: "₹75" },
    { zone: "Zone D", cities: ["Kolkata", "Bhubaneswar", "Guwahati"], time: "2-3 Days", fee: "₹100" }
  ];

  const deliveryOptions = [
    {
      type: "Express Delivery",
      time: "Same Day",
      price: "₹99",
      description: "Get your order delivered within 6 hours",
      icon: "🚀",
      popular: true
    },
    {
      type: "Standard Delivery",
      time: "1-2 Days",
      price: "Free*",
      description: "Free delivery on orders above ₹500",
      icon: "📦",
      popular: false
    },
    {
      type: "Scheduled Delivery",
      time: "Choose Date",
      price: "₹49",
      description: "Select your preferred delivery date and time",
      icon: "📅",
      popular: false
    }
  ];

  const trackingSteps = [
    { step: "Order Confirmed", status: "completed", time: "10:30 AM" },
    { step: "Picked from Farm", status: "completed", time: "2:15 PM" },
    { step: "In Transit", status: "active", time: "Expected 4:00 PM" },
    { step: "Out for Delivery", status: "pending", time: "Expected 5:30 PM" },
    { step: "Delivered", status: "pending", time: "Expected 6:00 PM" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚚 Delivery Information</h1>
          <p className="text-xl text-gray-600">
            Fast, reliable delivery from farm to your doorstep
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Track Order */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Track Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Enter your order ID" className="flex-1" />
                  <Button className="bg-green-600 hover:bg-green-700">
                    Track Order
                  </Button>
                </div>

                {/* Sample Tracking */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-semibold">Order #AGR-2024-001</h4>
                      <p className="text-sm text-gray-600">Organic Tomatoes & Spinach</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                  </div>

                  <div className="space-y-4">
                    {trackingSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : step.status === 'active' ? (
                            <Clock className="h-4 w-4 text-white" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            step.status === 'completed' ? 'text-green-600' :
                            step.status === 'active' ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step.step}
                          </p>
                          <p className="text-sm text-gray-500">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle>🚛 Delivery Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryOptions.map((option, index) => (
                    <div key={index} className={`relative border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      option.popular ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}>
                      {option.popular && (
                        <Badge className="absolute -top-2 left-4 bg-green-500 text-white">
                          Most Popular
                        </Badge>
                      )}
                      
                      <div className="text-center">
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <h3 className="font-semibold mb-1">{option.type}</h3>
                        <p className="text-2xl font-bold text-green-600 mb-2">{option.price}</p>
                        <p className="text-sm text-gray-600 mb-2">{option.time}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Zones */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Zones & Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryZones.map((zone, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{zone.zone}</h4>
                          <p className="text-sm text-gray-600">
                            {zone.cities.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{zone.time}</Badge>
                          <p className="text-sm font-medium text-green-600 mt-1">{zone.fee}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📍 Check if we deliver to your area</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Enter your pincode" className="flex-1" />
                    <Button variant="outline">Check</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Features */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="text-lg">✨ Delivery Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Temperature controlled vehicles</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Real-time tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Contactless delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Fresh produce guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Easy returns & refunds</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timing */}
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg">⏰ Delivery Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Morning Slot</span>
                  <span className="text-sm font-medium">8 AM - 12 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Afternoon Slot</span>
                  <span className="text-sm font-medium">12 PM - 4 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Evening Slot</span>
                  <span className="text-sm font-medium">4 PM - 8 PM</span>
                </div>
                
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700">
                    💡 Choose your preferred delivery slot during checkout
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery FAQ */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">❓ Quick FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm">What if I'm not home?</h5>
                  <p className="text-xs text-gray-600">We'll call you and can leave with neighbors or reschedule</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">Do you deliver on weekends?</h5>
                  <p className="text-xs text-gray-600">Yes, we deliver 7 days a week including holidays</p>
                </div>
                <div>
                  <h5 className="font-medium text-sm">How is freshness maintained?</h5>
                  <p className="text-xs text-gray-600">Temperature controlled vehicles and insulated packaging</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View All FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
