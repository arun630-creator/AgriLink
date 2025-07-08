import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Shield, Video, Flag, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import FarmerReputationBadge from '@/components/FarmerReputationBadge';
import ReviewSystem from '@/components/ReviewSystem';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

interface DetailedProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  description: string;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
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
  qualityGrade?: string;
  certifications?: string[];
  deliveryTime?: number;
  status: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch real product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProduct(id!),
    enabled: !!id,
  });

  // Gallery logic
  const images = product?.images && product.images.length > 0 ? product.images : [{ url: '/placeholder.svg', id: 'placeholder' }];
  const mainImage = images[selectedImageIndex]?.url || '/placeholder.svg';

  // Defensive values
  const price = product.price ?? product.basePrice ?? 0;
  const quantity = product.quantity ?? 0;
  const unit = product.unit ?? '';
  const harvestDate = product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A';
  const farmerName = product.farmer?.name || 'Unknown';
  const farmerLocation = product.farmer?.location || 'Unknown';
  const farmerRating = product.farmer?.rating ?? 0;
  const qualityMetrics = product.qualityMetrics || {};
  const isOrganic = product.organic;
  const isInStock = (product.status === 'active') && quantity > 0;
  const certifications = product.certifications || [];
  const deliveryTime = product.deliveryTime ?? 24;
  const description = product.description || '';
  const category = product.category || '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Product not found or failed to load.</p>
        </div>
      </div>
    );
  }

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
              <p className="text-gray-600 text-sm">{category}</p>
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
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-md flex items-center justify-center">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain max-h-[400px]"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`border rounded-md p-1 bg-white focus:outline-none ${selectedImageIndex === idx ? 'border-green-600' : 'border-gray-200'}`}
                  style={{ width: 64, height: 64 }}
                  type="button"
                >
                  <img
                    src={img.url}
                    alt={img.alt || product.name}
                    className="object-contain w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="space-y-6">
            {/* Price, Stock, Badges */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-green-600">₹{price}</span>
                <span className="text-gray-600 text-base">per {unit}</span>
                {isInStock ? (
                  <Badge className="bg-green-100 text-green-800 ml-2">In Stock</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 ml-2">Out of Stock</Badge>
                )}
                {isOrganic && <Badge className="bg-green-600 text-white ml-2">Organic</Badge>}
                {certifications.length > 0 && certifications.map(cert => (
                  <Badge key={cert} className="bg-blue-100 text-blue-800 ml-2">{cert}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {quantity} {unit}{quantity === 1 ? '' : 's'} available
              </p>
            </div>

            {/* Key Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Harvested: {harvestDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Shield className="w-4 h-4" />
                <span>Quality Grade: {product.qualityGrade || 'Standard'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>Seller: {farmerName} ({farmerLocation})</span>
                <Star className="w-4 h-4 text-yellow-400 ml-1" />
                <span>{farmerRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Delivery: {deliveryTime} hrs</span>
              </div>
            </div>

            {/* Add to Cart/Buy Now */}
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 py-3 text-lg"
              >
                {isInStock ? (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - ₹{price}
                  </>
                ) : (
                  'Out of Stock'
                )}
              </Button>
              {/* <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg">Buy Now</Button> */}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Product Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Quality Metrics (if available) */}
            {(qualityMetrics.taste !== undefined || qualityMetrics.freshness !== undefined || qualityMetrics.quantity !== undefined || qualityMetrics.packaging !== undefined) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {qualityMetrics.taste !== undefined ? qualityMetrics.taste.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Taste</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {qualityMetrics.freshness !== undefined ? qualityMetrics.freshness.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Freshness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {qualityMetrics.quantity !== undefined ? qualityMetrics.quantity.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Quantity Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {qualityMetrics.packaging !== undefined ? qualityMetrics.packaging.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Packaging</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
