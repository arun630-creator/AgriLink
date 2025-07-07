
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Video, Flag, Shield } from 'lucide-react';
import FarmerReputationBadge from './FarmerReputationBadge';

interface EnhancedProduct {
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
  flagCount?: number;
}

interface EnhancedProductCardProps {
  product: EnhancedProduct;
  onAddToCart: (productId: string) => void;
  onFlagProduct?: (productId: string) => void;
  showFarmerInfo?: boolean;
}

const EnhancedProductCard = ({ 
  product, 
  onAddToCart, 
  onFlagProduct,
  showFarmerInfo = true 
}: EnhancedProductCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();

  const hasQualityBadge = product.farmer.reputation.averageRating >= 4.5 && 
                         product.farmer.reputation.fulfillmentRate >= 95 && 
                         product.farmer.reputation.returnRate <= 5;

  const isHighlyRated = product.aggregateScore >= 4.5;
  const hasVideos = product.videos && product.videos.length > 0;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id);
  };

  const handleFlagProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFlagProduct?.(product.id);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-green-100 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Video Indicator */}
          {hasVideos && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-purple-600 text-white">
                <Video className="w-3 h-3 mr-1" />
                {product.videos!.length} Video{product.videos!.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {/* Quality Badge */}
          {hasQualityBadge && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-100 text-purple-800">
                <Shield className="w-3 h-3 mr-1" />
                Quality
              </Badge>
            </div>
          )}

          {/* Organic Badge */}
          {product.organic && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-green-600 text-white">Organic</Badge>
            </div>
          )}

          {/* Flag Button */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleFlagProduct}
              className="text-red-600 hover:text-red-700"
            >
              <Flag className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product Name & Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>
            
            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className={`w-4 h-4 ${isHighlyRated ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                <span className="text-sm font-medium">{product.aggregateScore.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''})
              </span>
              {isHighlyRated && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Highly Rated</Badge>
              )}
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
              <span className="text-gray-600">/{product.unit}</span>
            </div>
            <Badge variant={product.quantity > 0 ? "secondary" : "destructive"}>
              {product.quantity > 0 ? `${product.quantity} ${product.unit}s available` : 'Out of Stock'}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm">
              {showFullDescription || product.description.length <= 80
                ? product.description
                : `${product.description.substring(0, 80)}...`}
            </p>
            {product.description.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-green-600 text-xs hover:underline mt-1"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Farmer Info */}
          {showFarmerInfo && (
            <div className="border-t pt-3">
              <FarmerReputationBadge 
                reputation={product.farmer.reputation} 
                showDetails={false}
              />
              
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{product.farmer.location}</span>
                <Calendar className="w-3 h-3 ml-2" />
                <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
          >
            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>

          {/* Trust Indicators */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>✓ Quality Guaranteed</span>
            <span>✓ 24hr Refund Policy</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default EnhancedProductCard;
