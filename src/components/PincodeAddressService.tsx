import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, MapPin, Search, X, CheckCircle, AlertCircle, Home, Building } from 'lucide-react';
import { toast } from 'sonner';

interface AddressData {
  pincode: string;
  postOffice: string;
  district: string;
  state: string;
  city: string;
  area: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
}

interface PincodeAddressServiceProps {
  onAddressDetected: (address: AddressData) => void;
  onError: (error: string) => void;
}

const PincodeAddressService: React.FC<PincodeAddressServiceProps> = ({
  onAddressDetected,
  onError
}) => {
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [searchResults, setSearchResults] = useState<AddressData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [currentStep, setCurrentStep] = useState<'search' | 'results' | 'manual' | 'success'>('search');

  // Validate pincode format (6 digits for India)
  const isValidPincode = (pincode: string) => {
    return /^\d{6}$/.test(pincode);
  };

  // Fetch address by pincode using multiple APIs
  const fetchAddressByPincode = async (pincode: string): Promise<AddressData[]> => {
    const results: AddressData[] = [];

    // API 1: India Post API (Official)
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.ok) {
        const data = await response.json();
        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          results.push({
            pincode: pincode,
            postOffice: postOffice.Name,
            district: postOffice.District,
            state: postOffice.State,
            city: postOffice.Block || postOffice.District,
            area: postOffice.Name,
            fullAddress: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} - ${pincode}`,
            latitude: parseFloat(postOffice.Latitude) || undefined,
            longitude: parseFloat(postOffice.Longitude) || undefined,
          });
        }
      }
    } catch (error) {
      console.error('India Post API failed:', error);
    }

    // API 2: OpenStreetMap Nominatim (Fallback)
    if (results.length === 0) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=in&format=json&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          data.forEach((item: any) => {
            const address = item.display_name.split(', ');
            results.push({
              pincode: pincode,
              postOffice: address[0] || 'Unknown',
              district: address[address.length - 3] || address[address.length - 2] || 'Unknown',
              state: address[address.length - 1] || 'Unknown',
              city: address[address.length - 3] || address[address.length - 2] || 'Unknown',
              area: address[0] || 'Unknown',
              fullAddress: item.display_name,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            });
          });
        }
      } catch (error) {
        console.error('OpenStreetMap API failed:', error);
      }
    }

    // API 3: Manual fallback with common Indian cities
    if (results.length === 0) {
      const commonCities = getCommonCityByPincode(pincode);
      if (commonCities) {
        results.push({
          pincode: pincode,
          postOffice: 'Main Post Office',
          district: commonCities.district,
          state: commonCities.state,
          city: commonCities.city,
          area: 'Main Area',
          fullAddress: `${commonCities.city}, ${commonCities.district}, ${commonCities.state} - ${pincode}`,
        });
      }
    }

    return results;
  };

  // Common Indian cities by pincode ranges
  const getCommonCityByPincode = (pincode: string) => {
    const pincodeNum = parseInt(pincode);
    
    // Major cities pincode ranges
    const cityRanges = [
      { start: 110000, end: 110099, city: 'New Delhi', district: 'New Delhi', state: 'Delhi' },
      { start: 400000, end: 400099, city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
      { start: 700000, end: 700099, city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
      { start: 600000, end: 600099, city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
      { start: 500000, end: 500099, city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
      { start: 560000, end: 560099, city: 'Bangalore', district: 'Bangalore', state: 'Karnataka' },
      { start: 380000, end: 380099, city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' },
      { start: 302000, end: 302099, city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan' },
      { start: 226000, end: 226099, city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh' },
      { start: 800000, end: 800099, city: 'Patna', district: 'Patna', state: 'Bihar' },
      { start: 411000, end: 411099, city: 'Pune', district: 'Pune', state: 'Maharashtra' },
      { start: 110001, end: 110001, city: 'New Delhi', district: 'New Delhi', state: 'Delhi' },
      { start: 400001, end: 400001, city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra' },
      { start: 700001, end: 700001, city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
      { start: 600001, end: 600001, city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
      { start: 500001, end: 500001, city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
      { start: 560001, end: 560001, city: 'Bangalore', district: 'Bangalore', state: 'Karnataka' },
      { start: 380001, end: 380001, city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' },
      { start: 302001, end: 302001, city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan' },
      { start: 226001, end: 226001, city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh' },
      { start: 800001, end: 800001, city: 'Patna', district: 'Patna', state: 'Bihar' },
      { start: 411001, end: 411001, city: 'Pune', district: 'Pune', state: 'Maharashtra' },
    ];

    for (const range of cityRanges) {
      if (pincodeNum >= range.start && pincodeNum <= range.end) {
        return {
          city: range.city,
          district: range.district,
          state: range.state
        };
      }
    }

    return null;
  };

  const handlePincodeSearch = async () => {
    if (!isValidPincode(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSearching(true);
    setCurrentStep('results');

    try {
      const results = await fetchAddressByPincode(pincode);
      
      if (results.length > 0) {
        setSearchResults(results);
        if (results.length === 1) {
          // Auto-select if only one result
          selectAddress(results[0]);
        }
      } else {
        toast.error('No address found for this pincode. Please try manual entry.');
        setCurrentStep('manual');
      }
    } catch (error) {
      console.error('Pincode search failed:', error);
      toast.error('Failed to fetch address. Please try manual entry.');
      setCurrentStep('manual');
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (address: AddressData) => {
    setAddressData(address);
    setCurrentStep('success');
    onAddressDetected(address);
  };

  const handleManualSubmit = () => {
    if (!manualAddress.address || !manualAddress.city || !manualAddress.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const address: AddressData = {
      pincode: manualAddress.pincode,
      postOffice: 'Manual Entry',
      district: manualAddress.city,
      state: manualAddress.state,
      city: manualAddress.city,
      area: manualAddress.address,
      fullAddress: `${manualAddress.address}, ${manualAddress.city}, ${manualAddress.state} - ${manualAddress.pincode}`,
    };

    setAddressData(address);
    setCurrentStep('success');
    onAddressDetected(address);
  };

  const retrySearch = () => {
    setCurrentStep('search');
    setAddressData(null);
    setSearchResults([]);
    setPincode('');
  };

  if (currentStep === 'success' && addressData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Address Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800">{addressData.fullAddress}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-green-500">
                  <span>Pincode: {addressData.pincode}</span>
                  <span>• {addressData.city}, {addressData.state}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('search')}
              className="flex-1"
            >
              Change Address
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retrySearch}
              className="flex-1"
            >
              Search Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'results' && searchResults.length > 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Select Your Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} address(es) for pincode {pincode}
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((address, index) => (
              <button
                key={index}
                onClick={() => selectAddress(address)}
                className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{address.fullAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {address.city}, {address.state}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('manual')}
              className="flex-1"
            >
              Enter Manually
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retrySearch}
              className="flex-1"
            >
              Search Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'manual') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Enter Address Manually
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-address">Full Address *</Label>
              <Input
                id="manual-address"
                placeholder="House/Flat number, Street, Area"
                value={manualAddress.address}
                onChange={(e) => setManualAddress(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual-city">City *</Label>
                <Input
                  id="manual-city"
                  placeholder="City"
                  value={manualAddress.city}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="manual-state">State</Label>
                <Input
                  id="manual-state"
                  placeholder="State"
                  value={manualAddress.state}
                  onChange={(e) => setManualAddress(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="manual-pincode">Pincode *</Label>
              <Input
                id="manual-pincode"
                placeholder="6-digit pincode"
                value={manualAddress.pincode}
                onChange={(e) => setManualAddress(prev => ({ ...prev, pincode: e.target.value }))}
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleManualSubmit}
              className="flex-1"
              disabled={!manualAddress.address || !manualAddress.city || !manualAddress.pincode}
            >
              Use This Address
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('search')}
              className="flex-1"
            >
              Search by Pincode
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Find Address by Pincode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pincode">Enter Pincode</Label>
          <div className="relative">
            <Input
              id="pincode"
              placeholder="Enter 6-digit pincode (e.g., 110001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={(e) => e.key === 'Enter' && handlePincodeSearch()}
              maxLength={6}
              className="pr-10"
            />
            {pincode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPincode('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your 6-digit postal pincode to find your exact address
          </p>
        </div>

        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching for address...
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handlePincodeSearch}
            disabled={!isValidPincode(pincode) || isSearching}
            className="flex-1"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Address
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep('manual')}
            className="flex-1"
          >
            Enter Manually
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PincodeAddressService; 