import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  Package,
  Sparkles,
  Users,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { apiService, Product } from '@/lib/api';
import ProductCard from './ProductCard';

interface Recommendation {
  type: 'personalized' | 'trending' | 'seasonal' | 'similar' | 'location_based';
  products: Product[];
  confidence: number;
  reason: string;
}

interface UserPreferences {
  categories: string[];
  priceRange: [number, number];
  preferredFarmers: string[];
  organicPreference: boolean;
  locationPreference: string;
}

const AIRecommendationSystem = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('personalized');

  useEffect(() => {
    fetchRecommendations();
    fetchUserPreferences();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/recommendations/ai');
      if (response.success) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await apiService.get('/user/preferences');
      if (response.success) {
        setUserPreferences(response.data);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const handleProductClick = async (productId: string, recommendationType: string) => {
    try {
      // Track recommendation click for ML model improvement
      await apiService.post('/recommendations/track', {
        productId,
        recommendationType,
        action: 'click'
      });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  };

  const handleAddToCart = async (productId: string, recommendationType: string) => {
    try {
      // Track add to cart action
      await apiService.post('/recommendations/track', {
        productId,
        recommendationType,
        action: 'add_to_cart'
      });
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'personalized':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'seasonal':
        return <Clock className="w-5 h-5 text-green-500" />;
      case 'similar':
        return <Users className="w-5 h-5 text-orange-500" />;
      case 'location_based':
        return <MapPin className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRecommendationTitle = (type: string) => {
    switch (type) {
      case 'personalized':
        return 'Personalized for You';
      case 'trending':
        return 'Trending Now';
      case 'seasonal':
        return 'Seasonal Picks';
      case 'similar':
        return 'Similar to Your Favorites';
      case 'location_based':
        return 'Near You';
      default:
        return 'Recommended';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="w-8 h-8 animate-pulse" />
        <span className="ml-2">AI is analyzing your preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-900">AI-Powered Recommendations</h2>
        </div>
        <p className="text-gray-600">
          Discover products tailored to your preferences using advanced machine learning
        </p>
      </div>

      {/* User Preferences Summary */}
      {userPreferences && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your AI Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {userPreferences.categories.length}
                </div>
                <div className="text-sm text-gray-600">Preferred Categories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  ₹{userPreferences.priceRange[0]} - ₹{userPreferences.priceRange[1]}
                </div>
                <div className="text-sm text-gray-600">Price Range</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {userPreferences.preferredFarmers.length}
                </div>
                <div className="text-sm text-gray-600">Favorite Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {userPreferences.organicPreference ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-600">Organic Preference</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {recommendations.map((rec) => (
            <TabsTrigger key={rec.type} value={rec.type} className="flex items-center gap-2">
              {getRecommendationIcon(rec.type)}
              <span className="hidden sm:inline">{getRecommendationTitle(rec.type)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {recommendations.map((recommendation) => (
          <TabsContent key={recommendation.type} value={recommendation.type} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(recommendation.type)}
                    <CardTitle>{getRecommendationTitle(recommendation.type)}</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(recommendation.confidence * 100)}% match
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRecommendations}
                  >
                    Refresh
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{recommendation.reason}</p>
              </CardHeader>
              <CardContent>
                {recommendation.products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p>No recommendations available for this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recommendation.products.map((product) => (
                      <div key={product.id || product._id} className="relative">
                        <ProductCard
                          product={product}
                          onProductClick={() => handleProductClick(product.id || product._id!, recommendation.type)}
                          onAddToCart={() => handleAddToCart(product.id || product._id!, recommendation.type)}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            AI Pick
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">Trending</div>
              <div className="text-sm text-gray-600">
                Based on current market trends and user behavior
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">Collaborative</div>
              <div className="text-sm text-gray-600">
                Similar users with matching preferences
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-semibold">Location</div>
              <div className="text-sm text-gray-600">
                Optimized for your delivery area
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle>Help Improve Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Heart className="w-6 h-6" />
              <span>Rate Recommendations</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <ShoppingCart className="w-6 h-6" />
              <span>Update Preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendationSystem; 