
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import FarmerReputationBadge from '@/components/FarmerReputationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, Phone, Mail, Award, Package, TrendingUp } from 'lucide-react';

const FarmerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock farmer data - in real app this would be fetched based on ID
  const farmer = {
    id: '1',
    name: 'Green Valley Farm',
    owner: 'Ravi Kumar',
    location: 'Pune, Maharashtra',
    rating: 4.8,
    totalReviews: 245,
    speciality: ['Organic Vegetables', 'Leafy Greens', 'Seasonal Fruits'],
    totalProducts: 15,
    totalOrders: 890,
    joinedDate: '2022-03-15',
    image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
    description: 'We are a family-owned organic farm committed to sustainable farming practices. Our farm spans 50 acres where we grow a wide variety of organic vegetables and fruits using traditional methods combined with modern organic techniques.',
    certifications: ['Organic Certified', 'FSSAI Licensed', 'Good Agricultural Practices'],
    deliveryAreas: ['Pune', 'Mumbai', 'Nashik', 'Aurangabad'],
    contact: {
      phone: '+91 98765 43210',
      email: 'contact@greenvalleyfarm.com',
      whatsapp: '+91 98765 43210'
    },
    reputation: {
      farmerId: '1',
      farmerName: 'Green Valley Farm',
      totalOrders: 890,
      fulfillmentRate: 98,
      averageRating: 4.8,
      returnRate: 2,
      responseTime: '< 2 hours',
      qualityBadges: ['Organic Certified', 'Fresh Guarantee', 'Sustainable Farming'],
      joinedDate: 'March 2022'
    },
    stats: {
      totalCustomers: 324,
      repeatCustomers: 78,
      averageOrderValue: 650,
      monthlyGrowth: 15
    }
  };

  // Mock products from this farmer
  const farmerProducts = [
    {
      id: '1',
      name: 'Organic Tomatoes',
      price: 45,
      unit: 'kg',
      quantity: 150,
      category: 'Vegetables',
      description: 'Fresh organic tomatoes grown without pesticides',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
      farmer: {
        name: 'Green Valley Farm',
        location: 'Maharashtra',
        rating: 4.8
      },
      harvestDate: '2024-01-15',
      organic: true
    },
    {
      id: '2',
      name: 'Fresh Spinach',
      price: 30,
      unit: 'kg',
      quantity: 80,
      category: 'Vegetables',
      description: 'Crisp and fresh spinach leaves packed with nutrients',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f8dfd?w=400',
      farmer: {
        name: 'Green Valley Farm',
        location: 'Maharashtra',
        rating: 4.8
      },
      harvestDate: '2024-01-14',
      organic: true
    }
  ];

  // Mock reviews
  const reviews = [
    {
      id: '1',
      customerName: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent quality vegetables! Always fresh and delivered on time.',
      date: '2024-01-10',
      verified: true,
      images: []
    },
    {
      id: '2',
      customerName: 'Amit Patel',
      rating: 4,
      comment: 'Good quality organic produce. Slightly expensive but worth it.',
      date: '2024-01-08',
      verified: true,
      images: []
    }
  ];

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Farmer not found</h2>
          <Button onClick={() => navigate('/farmers')}>Back to Farmers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cover Section */}
        <div className="relative mb-8">
          <div 
            className="h-64 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${farmer.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
          </div>
          
          <div className="absolute bottom-6 left-6 flex items-end gap-6">
            <img
              src={farmer.image}
              alt={farmer.name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
            <div className="text-white">
              <h1 className="text-3xl font-bold">{farmer.name}</h1>
              <p className="text-lg opacity-90">by {farmer.owner}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{farmer.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="products">Products ({farmer.totalProducts})</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({farmer.totalReviews})</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {farmerProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showFarmerInfo={false}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {farmer.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600">{farmer.description}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Specialities</h4>
                      <div className="flex flex-wrap gap-2">
                        {farmer.speciality.map((spec, index) => (
                          <Badge key={index} variant="outline">{spec}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {farmer.certifications.map((cert, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800">
                            <Award className="w-3 h-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Delivery Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {farmer.deliveryAreas.map((area, index) => (
                          <Badge key={index} variant="secondary">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.customerName}</span>
                              {review.verified && (
                                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{farmer.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{farmer.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span>WhatsApp: {farmer.contact.whatsapp}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Farmer Reputation */}
            <FarmerReputationBadge reputation={farmer.reputation} showDetails={true} />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farm Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-medium">{farmer.stats.totalCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repeat Customers</span>
                  <span className="font-medium">{farmer.stats.repeatCustomers}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Order Value</span>
                  <span className="font-medium">₹{farmer.stats.averageOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-medium text-green-600">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {farmer.stats.monthlyGrowth}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-semibold">{new Date(farmer.joinedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDetail;
