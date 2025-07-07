import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Truck, Shield, Users, TrendingUp, Loader2 } from "lucide-react";
import { apiService, Product } from "@/lib/api";

const Index = () => {
  const navigate = useNavigate();

  // Fetch featured products
  const {
    data: featuredProductsData,
    isLoading: isLoadingFeatured,
    error: featuredError
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiService.getFeaturedProducts(6),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });

  const stats = [
    { icon: Users, label: "Active Farmers", value: "1000+", color: "text-green-600" },
    { icon: ShoppingCart, label: "Products Available", value: "5000+", color: "text-blue-600" },
    { icon: Truck, label: "Deliveries Made", value: "10,000+", color: "text-purple-600" },
    { icon: Star, label: "Customer Rating", value: "4.8/5", color: "text-yellow-600" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All products are quality checked before delivery"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Fresh produce delivered within 24 hours"
    },
    {
      icon: Star,
      title: "Best Prices",
      description: "Direct from farmers means better prices for you"
    }
  ];

  // Transform API data to match ProductCard expectations
  const transformProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    quantity: product.quantity,
    category: product.category,
    description: product.description,
    image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    farmer: {
      name: product.farmer.name,
      location: product.farmer.location || "Unknown",
      rating: product.farmer.rating || 0
    },
    harvestDate: product.harvestDate,
    organic: product.organic
  });

  const featuredProducts = featuredProductsData?.products || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Fresh From Farm to Your Table
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Connect directly with farmers and get the freshest produce delivered to your doorstep. 
            Supporting local agriculture, one order at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto"
              onClick={() => navigate('/marketplace')}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-600 w-full sm:w-auto"
              onClick={() => navigate('/farmers')}
            >
              Meet Our Farmers
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center p-4">
                  <IconComponent className={`h-8 w-8 sm:h-12 sm:w-12 ${stat.color} mx-auto mb-2 sm:mb-3`} />
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Products</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">Fresh picks from our trusted farmers</p>
          </div>
          
          {/* Loading State */}
          {isLoadingFeatured && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-gray-600">Loading featured products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {featuredError && !isLoadingFeatured && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Unable to load featured products</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Featured Products Grid */}
          {!isLoadingFeatured && !featuredError && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={transformProductForCard(product)}
                  showFarmerInfo={true}
                />
              ))}
            </div>
          )}

          {/* No Featured Products */}
          {!isLoadingFeatured && !featuredError && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No featured products available at the moment</p>
              <Button 
                onClick={() => navigate('/marketplace')}
                className="bg-green-600 hover:bg-green-700"
              >
                Browse All Products
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/marketplace')}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Why Choose AgriDirect?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center border-green-100 hover:shadow-lg transition-shadow p-6">
                  <CardHeader className="pb-4">
                    <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust AgriDirect for fresh, quality produce delivered right to their doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto"
              onClick={() => navigate('/marketplace')}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-green-600 w-full sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Join as Farmer
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
