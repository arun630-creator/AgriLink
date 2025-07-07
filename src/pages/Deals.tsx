
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Percent, Star, TrendingDown } from "lucide-react";

const Deals = () => {
  const featuredDeals = [
    {
      id: "deal-1",
      name: "Organic Tomato Bundle",
      price: 35,
      originalPrice: 50,
      unit: "kg",
      quantity: 100,
      category: "Vegetables",
      description: "Premium organic tomatoes - perfect for cooking and salads",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
      farmer: {
        name: "Green Valley Farm",
        location: "Maharashtra",
        rating: 4.8
      },
      harvestDate: "2024-01-15",
      organic: true,
      discount: 30,
      dealType: "flash",
      endsIn: "2 hours"
    },
    {
      id: "deal-2",
      name: "Mixed Fruit Box",
      price: 180,
      originalPrice: 220,
      unit: "box",
      quantity: 50,
      category: "Fruits",
      description: "Seasonal fruit mix - apples, oranges, bananas, and more",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
      farmer: {
        name: "Orchard Hills",
        location: "Punjab",
        rating: 4.9
      },
      harvestDate: "2024-01-12",
      organic: false,
      discount: 18,
      dealType: "weekly",
      endsIn: "3 days"
    },
    {
      id: "deal-3",
      name: "Premium Basmati Rice",
      price: 85,
      originalPrice: 100,
      unit: "kg",
      quantity: 200,
      category: "Grains",
      description: "Aromatic basmati rice directly from Punjab fields",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      farmer: {
        name: "Golden Fields",
        location: "Punjab",
        rating: 4.7
      },
      harvestDate: "2024-01-08",
      organic: false,
      discount: 15,
      dealType: "bulk",
      endsIn: "1 week"
    }
  ];

  const handleAddToCart = (productId: string) => {
    console.log("Adding deal product to cart:", productId);
  };

  const getDealBadge = (dealType: string) => {
    switch (dealType) {
      case "flash":
        return <Badge className="bg-red-500 text-white">⚡ Flash Deal</Badge>;
      case "weekly":
        return <Badge className="bg-blue-500 text-white">📅 Weekly Deal</Badge>;
      case "bulk":
        return <Badge className="bg-purple-500 text-white">📦 Bulk Deal</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">💰 Special Deal</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔥 Hot Deals & Offers</h1>
          <p className="text-xl text-gray-600">
            Limited time offers on fresh produce - save big while supporting local farmers!
          </p>
        </div>

        {/* Deal Types */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center border-red-200">
            <CardContent className="p-4">
              <Timer className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-red-700">Flash Deals</h3>
              <p className="text-sm text-gray-600">Limited time offers</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200">
            <CardContent className="p-4">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-700">Weekly Specials</h3>
              <p className="text-sm text-gray-600">Best deals of the week</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200">
            <CardContent className="p-4">
              <Percent className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-700">Bulk Discounts</h3>
              <p className="text-sm text-gray-600">Save more on large orders</p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-green-200">
            <CardContent className="p-4">
              <TrendingDown className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-700">Seasonal Offers</h3>
              <p className="text-sm text-gray-600">Best prices in season</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Deals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.map((deal) => (
              <div key={deal.id} className="relative">
                {/* Deal Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {getDealBadge(deal.dealType)}
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-red-500 text-white font-bold">
                    -{deal.discount}%
                  </Badge>
                </div>

                {/* Timer Badge */}
                <div className="absolute bottom-2 left-2 z-10">
                  <Badge variant="outline" className="bg-white/90 text-red-600 border-red-200">
                    <Timer className="w-3 h-3 mr-1" />
                    Ends in {deal.endsIn}
                  </Badge>
                </div>

                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-green-100">
                  <div className="relative">
                    <img 
                      src={deal.image} 
                      alt={deal.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{deal.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-green-600">₹{deal.price}</span>
                      <span className="text-lg text-gray-400 line-through">₹{deal.originalPrice}</span>
                      <span className="text-sm text-gray-500">per {deal.unit}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{deal.description}</p>
                    
                    <div className="text-sm text-gray-500 mb-3">
                      <p>{deal.farmer.name}, {deal.farmer.location}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{deal.farmer.rating}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleAddToCart(deal.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Add to Cart - Save ₹{deal.originalPrice - deal.price}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Never Miss a Deal!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter and be the first to know about exclusive deals and offers.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button className="bg-green-600 hover:bg-green-700">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deals;
