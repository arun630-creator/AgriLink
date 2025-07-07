
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Package, Award, Search } from 'lucide-react';

interface Farmer {
  id: string;
  name: string;
  location: string;
  state: string;
  rating: number;
  totalReviews: number;
  speciality: string[];
  totalProducts: number;
  totalOrders: number;
  joinedDate: string;
  image: string;
  fulfillmentRate: number;
  responseTime: string;
  qualityBadges: string[];
  isVerified: boolean;
  isOrganic: boolean;
}

const Farmers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Mock farmers data - in real app this would come from API
  const farmers: Farmer[] = [
    {
      id: '1',
      name: 'Green Valley Farm',
      location: 'Pune',
      state: 'Maharashtra',
      rating: 4.8,
      totalReviews: 245,
      speciality: ['Organic Vegetables', 'Leafy Greens'],
      totalProducts: 15,
      totalOrders: 890,
      joinedDate: '2022-03-15',
      image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400',
      fulfillmentRate: 98,
      responseTime: '< 2 hours',
      qualityBadges: ['Organic Certified', 'Fresh Guarantee'],
      isVerified: true,
      isOrganic: true
    },
    {
      id: '2',
      name: 'Hill Station Orchards',
      location: 'Shimla',
      state: 'Himachal Pradesh',
      rating: 4.9,
      totalReviews: 187,
      speciality: ['Fruits', 'Apples', 'Stone Fruits'],
      totalProducts: 12,
      totalOrders: 654,
      joinedDate: '2021-09-22',
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
      fulfillmentRate: 96,
      responseTime: '< 3 hours',
      qualityBadges: ['Premium Quality', 'Hill Station Fresh'],
      isVerified: true,
      isOrganic: false
    },
    {
      id: '3',
      name: 'Golden Fields',
      location: 'Amritsar',
      state: 'Punjab',
      rating: 4.7,
      totalReviews: 312,
      speciality: ['Grains', 'Rice', 'Wheat'],
      totalProducts: 8,
      totalOrders: 1205,
      joinedDate: '2020-12-10',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      fulfillmentRate: 94,
      responseTime: '< 4 hours',
      qualityBadges: ['Bulk Supplier', 'Traditional Methods'],
      isVerified: true,
      isOrganic: false
    },
    {
      id: '4',
      name: 'Tropical Gardens',
      location: 'Mangalore',
      state: 'Karnataka',
      rating: 4.6,
      totalReviews: 156,
      speciality: ['Exotic Fruits', 'Tropical Produce'],
      totalProducts: 10,
      totalOrders: 423,
      joinedDate: '2023-01-18',
      image: 'https://images.unsplash.com/photo-1566281796817-93bc94d7dbd2?w=400',
      fulfillmentRate: 92,
      responseTime: '< 6 hours',
      qualityBadges: ['Exotic Specialist'],
      isVerified: false,
      isOrganic: true
    },
    {
      id: '5',
      name: 'Dairy Direct',
      location: 'Ludhiana',
      state: 'Punjab',
      rating: 4.9,
      totalReviews: 89,
      speciality: ['Dairy Products', 'Milk', 'Cheese'],
      totalProducts: 6,
      totalOrders: 267,
      joinedDate: '2023-06-05',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      fulfillmentRate: 99,
      responseTime: '< 1 hour',
      qualityBadges: ['Fresh Daily', 'Farm Fresh'],
      isVerified: true,
      isOrganic: true
    }
  ];

  const states = [...new Set(farmers.map(farmer => farmer.state))];
  const specialities = [...new Set(farmers.flatMap(farmer => farmer.speciality))];

  const filteredFarmers = farmers
    .filter(farmer => {
      const matchesSearch = searchQuery === '' || 
        farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farmer.speciality.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLocation = locationFilter === '' || farmer.state === locationFilter;
      const matchesSpeciality = specialityFilter === '' || farmer.speciality.includes(specialityFilter);
      
      return matchesSearch && matchesLocation && matchesSpeciality;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'orders': return b.totalOrders - a.totalOrders;
        case 'products': return b.totalProducts - a.totalProducts;
        case 'newest': return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default: return 0;
      }
    });

  const handleFarmerClick = (farmerId: string) => {
    navigate(`/farmers/${farmerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍🌾 Our Farmers</h1>
          <p className="text-gray-600">Connect directly with verified farmers across India</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search farmers, locations, specialities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialities</SelectItem>
                  {specialities.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="products">Most Products</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <Card 
              key={farmer.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-green-100"
              onClick={() => handleFarmerClick(farmer.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={farmer.image}
                    alt={farmer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{farmer.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {farmer.location}, {farmer.state}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{farmer.rating}</span>
                    <span className="text-sm text-gray-500">({farmer.totalReviews})</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {farmer.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {farmer.isOrganic && (
                      <Badge className="bg-green-600 text-white">Organic</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specialities:</p>
                    <div className="flex flex-wrap gap-1">
                      {farmer.speciality.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {farmer.speciality.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{farmer.speciality.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{farmer.totalProducts} Products</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orders: </span>
                      <span className="font-medium">{farmer.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fulfillment: </span>
                      <span className={`font-medium ${farmer.fulfillmentRate >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                        {farmer.fulfillmentRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Response: </span>
                      <span className="font-medium">{farmer.responseTime}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFarmerClick(farmer.id);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    View Profile & Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFarmers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium mb-2">No farmers found</p>
                <p>Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Farmers;
