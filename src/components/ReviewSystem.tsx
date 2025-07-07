
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Camera, Upload, Flag } from 'lucide-react';

interface Review {
  id: string;
  buyerName: string;
  rating: {
    taste: number;
    freshness: number;
    quantity: number;
    overall: number;
  };
  comment: string;
  images: string[];
  date: string;
  verified: boolean;
}

interface ReviewSystemProps {
  productId: string;
  reviews: Review[];
  canReview: boolean;
  onSubmitReview?: (review: Partial<Review>) => void;
  onFlagProduct?: () => void;
}

const ReviewSystem = ({ productId, reviews, canReview, onSubmitReview, onFlagProduct }: ReviewSystemProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: { taste: 0, freshness: 0, quantity: 0, overall: 0 },
    comment: '',
    images: [] as string[]
  });

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const handleSubmitReview = () => {
    if (onSubmitReview) {
      onSubmitReview(newReview);
      setShowReviewForm(false);
      setNewReview({
        rating: { taste: 0, freshness: 0, quantity: 0, overall: 0 },
        comment: '',
        images: []
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In real implementation, upload to cloud storage
      const imageUrls = Array.from(files).map(() => 
        `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400`
      );
      setNewReview(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Customer Reviews ({reviews.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{calculateAverageRating()} ⭐</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onFlagProduct}
                className="text-red-600 hover:text-red-700"
              >
                <Flag className="w-4 h-4 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Rating Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taste</p>
              <div className="font-semibold">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating.taste, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Freshness</p>
              <div className="font-semibold">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating.freshness, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Quantity</p>
              <div className="font-semibold">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating.quantity, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Overall</p>
              <div className="font-semibold">{calculateAverageRating()}</div>
            </div>
          </div>

          {/* Add Review Button */}
          {canReview && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} className="w-full">
              <Star className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-4">Rate Your Experience</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Taste:</label>
                      {renderStars(newReview.rating.taste, (rating) => 
                        setNewReview(prev => ({
                          ...prev,
                          rating: { ...prev.rating, taste: rating }
                        }))
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Freshness:</label>
                      {renderStars(newReview.rating.freshness, (rating) => 
                        setNewReview(prev => ({
                          ...prev,
                          rating: { ...prev.rating, freshness: rating }
                        }))
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quantity Match:</label>
                      {renderStars(newReview.rating.quantity, (rating) => 
                        setNewReview(prev => ({
                          ...prev,
                          rating: { ...prev.rating, quantity: rating }
                        }))
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Overall:</label>
                      {renderStars(newReview.rating.overall, (rating) => 
                        setNewReview(prev => ({
                          ...prev,
                          rating: { ...prev.rating, overall: rating }
                        }))
                      )}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Photos:</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="review-images"
                      />
                      <label htmlFor="review-images" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Add Photos</span>
                        </div>
                      </label>
                      {newReview.images.length > 0 && (
                        <Badge variant="secondary">{newReview.images.length} photos</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview} className="flex-1">
                      Submit Review
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{review.buyerName}</h4>
                    {review.verified && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Verified Buyer
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {renderStars(review.rating.overall)}
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Rating Breakdown */}
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-3">
                <div>Taste: {review.rating.taste}/5</div>
                <div>Freshness: {review.rating.freshness}/5</div>
                <div>Quantity: {review.rating.quantity}/5</div>
              </div>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt="Review"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewSystem;
