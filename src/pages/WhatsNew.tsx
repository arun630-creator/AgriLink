
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, TrendingUp, Users } from "lucide-react";

const WhatsNew = () => {
  const navigate = useNavigate();

  const newProducts = [
    {
      id: "new-1",
      name: "Dragon Fruit",
      price: 150,
      unit: "kg",
      quantity: 25,
      category: "Fruits",
      description: "Exotic dragon fruit - rich in antioxidants and vitamins",
      image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400",
      farmer: {
        name: "Tropical Gardens",
        location: "Karnataka",
        rating: 4.9
      },
      harvestDate: "2024-01-16",
      organic: true,
      isNew: true,
      addedDate: "2024-01-16"
    },
    {
      id: "new-2",
      name: "Purple Cabbage",
      price: 40,
      unit: "kg",
      quantity: 80,
      category: "Vegetables",
      description: "Nutrient-rich purple cabbage perfect for salads and cooking",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
      farmer: {
        name: "Rainbow Farms",
        location: "Maharashtra",
        rating: 4.7
      },
      harvestDate: "2024-01-15",
      organic: true,
      isNew: true,
      addedDate: "2024-01-15"
    },
    {
      id: "new-3",
      name: "Black Quinoa",
      price: 200,
      unit: "kg",
      quantity: 30,
      category: "Grains",
      description: "Premium black quinoa - superfood packed with protein",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      farmer: {
        name: "Healthy Grains Co",
        location: "Rajasthan",
        rating: 4.8
      },
      harvestDate: "2024-01-14",
      organic: true,
      isNew: true,
      addedDate: "2024-01-14"
    }
  ];

  const newFarmers = [
    {
      id: '4',
      name: "Sunrise Organic Farm",
      location: "Tamil Nadu",
      speciality: "Organic Vegetables",
      joinDate: "January 2024",
      rating: 4.9,
      products: 12
    },
    {
      id: '5',
      name: "Mountain Fresh Fruits",
      location: "Himachal Pradesh",
      speciality: "Hill Station Fruits",
      joinDate: "January 2024",
      rating: 4.8,
      products: 8
    }
  ];

  const updates = [
    {
      id: 1,
      title: "New Delivery Zones Added",
      description: "We now deliver to 50+ new cities across India",
      date: "Jan 15, 2024",
      type: "feature"
    },
    {
      id: 2,
      title: "Seasonal Winter Produce Available",
      description: "Fresh winter vegetables and fruits now in stock",
      date: "Jan 12, 2024",
      type: "seasonal"
    },
    {
      id: 3,
      title: "Mobile App Launched",
      description: "Download our new mobile app for better shopping experience",
      date: "Jan 10, 2024",
      type: "app"
    }
  ];

  const handleViewAllProducts = () => {
    navigate('/marketplace?filter=new');
  };

  const handleViewFarmerProfile = (farmerId: string) => {
    navigate(`/farmers/${farmerId}`);
  };

  const handleViewAllFarmers = () => {
    navigate('/farmers?filter=newest');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">✨ What's New</h1>
          <p className="text-xl text-gray-600">
            Discover the latest products, farmers, and updates on AgriDirect
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center border-green-200">
            <CardContent className="p-4">
              <Sparkles className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-600">12</h3>
              <p className="text-sm text-gray-600">New Products This Week</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200">
            <CardContent className="p-4">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-600">5</h3>
              <p className="text-sm text-gray-600">New Farmers Joined</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200">
            <CardContent className="p-4">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-600">25+</h3>
              <p className="text-sm text-gray-600">Cities Added</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-orange-200">
            <CardContent className="p-4">
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-orange-600">3</h3>
              <p className="text-sm text-gray-600">Platform Updates</p>
            </CardContent>
          </Card>
        </div>

        {/* New Products */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🆕 Latest Products</h2>
            <Badge className="bg-green-100 text-green-800">
              Added this week
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {newProducts.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    NEW
                  </Badge>
                </div>
                <ProductCard
                  product={product}
                  showFarmerInfo={true}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={handleViewAllProducts}
            >
              View All New Products
            </Button>
          </div>
        </div>

        {/* New Farmers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">👨‍🌾 Welcome New Farmers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newFarmers.map((farmer) => (
              <Card 
                key={farmer.id} 
                className="border-green-100 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewFarmerProfile(farmer.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{farmer.name}</CardTitle>
                      <p className="text-gray-600">{farmer.location}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Joined {farmer.joinDate}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speciality:</span>
                      <span className="font-medium">{farmer.speciality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">{farmer.products} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">⭐ {farmer.rating}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewFarmerProfile(farmer.id);
                    }}
                  >
                    View Profile & Products
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={handleViewAllFarmers}
            >
              View All Farmers
            </Button>
          </div>
        </div>

        {/* Platform Updates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📢 Recent Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {updates.map((update) => (
              <Card key={update.id} className="border-blue-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{update.title}</CardTitle>
                    <Badge variant="outline">
                      {update.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{update.description}</p>
                  <p className="text-sm text-gray-500">{update.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Updated with AgriDirect
            </h3>
            <p className="text-gray-600 mb-6">
              Follow us on social media and subscribe to our newsletter to never miss new products and updates.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-green-600 hover:bg-green-700">
                Subscribe to Newsletter
              </Button>
              <Button variant="outline">
                Follow on Social Media
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsNew;
