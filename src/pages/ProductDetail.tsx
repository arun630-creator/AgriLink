
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Shield, Video, Flag, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import FarmerReputationBadge from '@/components/FarmerReputationBadge';
import ReviewSystem from '@/components/ReviewSystem';

interface DetailedProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  description: string;
  image: string;
  farmer: {
    name: string;
    location: string;
    rating: number;
    reputation: {
      farmerId: string;
      farmerName: string;
      totalOrders: number;
      fulfillmentRate: number;
      averageRating: number;
      returnRate: number;
      responseTime: string;
      qualityBadges: string[];
      joinedDate: string;
    };
  };
  harvestDate: string;
  organic: boolean;
  videos?: Array<{
    id: string;
    url: string;
    title: string;
    duration: string;
  }>;
  aggregateScore: number;
  totalReviews: number;
  qualityMetrics: {
    taste: number;
    freshness: number;
    quantity: number;
    packaging: number;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock product data - in real app, fetch based on ID
  useEffect(() => {
    const mockProduct: DetailedProduct = {
      id: id || '1',
      name: 'Organic Tomatoes',
      price: 45,
      unit: 'kg',
      quantity: 150,
      category: 'Vegetables',
      description: 'Fresh organic tomatoes grown without pesticides in the fertile valleys of Maharashtra. These tomatoes are hand-picked at peak ripeness to ensure maximum flavor and nutritional value. Perfect for cooking, salads, and sauces.',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
      farmer: {
        name: 'Green Valley Farm',
        location: 'Maharashtra',
        rating: 4.8,
        reputation: {
          farmerId: 'farmer-1',
          farmerName: 'Green Valley Farm',
          totalOrders: 245,
          fulfillmentRate: 97,
          averageRating: 4.8,
          returnRate: 2,
          responseTime: '< 2 hours',
          qualityBadges: ['Organic Certified', 'Fresh Guarantee', 'Quality Assured'],
          joinedDate: '2023-01-15'
        }
      },
      harvestDate: '2024-01-15',
      organic: true,
      videos: [
        {
          id: 'v1',
          url: 'https://example.com/video1.mp4',
          title: 'Farm Tour - Tomato Fields',
          duration: '0:25'
        },
        {
          id: 'v2',
          url: 'https://example.com/video2.mp4',
          title: 'Harvesting Process',
          duration: '0:18'
        }
      ],
      aggregateScore: 4.6,
      totalReviews: 89,
      qualityMetrics: {
        taste: 4.7,
        freshness: 4.8,
        quantity: 4.5,
        packaging: 4.4
      }
    };
    setProduct(mockProduct);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      toast.success(`${product.name} added to cart!`);
      console.log('Added to cart:', product.id);
    }
  };

  const handleFlagProduct = () => {
    toast.info('Product flagged for review');
    console.log('Product flagged:', product?.id);
  };

  const mockReviews = [
    {
      id: '1',
      buyerName: 'Priya S.',
      rating: {
        taste: 5,
        freshness: 4,
        quantity: 5,
        overall: 5
      },
      comment: 'Excellent quality tomatoes! Very fresh and tasty. Perfect for making curry.',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
      date: '2024-01-20',
      verified: true
    },
    {
      id: '2',
      buyerName: 'Rajesh K.',
      rating: {
        taste: 4,
        freshness: 5,
        quantity: 4,
        overall: 4
      },
      comment: 'Good quality organic tomatoes. Delivery was prompt and packaging was good.',
      images: [],
      date: '2024-01-18',
      verified: true
    }
  ];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">{product.category}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlagProduct}
              className="text-red-600 hover:text-red-700"
            >
              <Flag className="w-4 h-4 mr-1" />
              Report
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images & Videos */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-md">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Videos Section */}
            {product.videos && product.videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Farm Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {product.videos.map((video) => (
                      <div key={video.id} className="bg-gray-100 rounded-lg p-4 text-center">
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium">{video.title}</p>
                        <p className="text-xs text-gray-500">{video.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-100 text-green-800">{product.category}</Badge>
                {product.organic && (
                  <Badge className="bg-green-600 text-white">Organic</Badge>
                )}
                <Badge className="bg-purple-100 text-purple-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Quality Assured
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                  <span className="text-gray-600">per {product.unit}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {product.quantity} {product.unit}s available
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{product.farmer.location}</span>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{product.qualityMetrics.taste.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Taste</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{product.qualityMetrics.freshness.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Freshness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{product.qualityMetrics.quantity.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Quantity Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{product.qualityMetrics.packaging.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Packaging</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 py-3 text-lg"
            >
              {product.quantity > 0 ? (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ₹{product.price}
                </>
              ) : (
                'Out of Stock'
              )}
            </Button>
          </div>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="seller" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seller">Seller Information</TabsTrigger>
            <TabsTrigger value="reviews">Reviews & Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="seller" className="space-y-4">
            <FarmerReputationBadge 
              reputation={product.farmer.reputation} 
              showDetails={true}
            />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <ReviewSystem
              productId={product.id}
              reviews={mockReviews}
              canReview={true}
              onSubmitReview={(review) => {
                console.log('New review submitted:', review);
                toast.success('Review submitted successfully!');
              }}
              onFlagProduct={handleFlagProduct}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
