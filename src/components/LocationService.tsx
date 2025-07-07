import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Crosshair
} from 'lucide-react';
import { toast } from 'sonner';

interface AddressData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface LocationServiceProps {
  onAddressDetected: (address: AddressData) => void;
  currentAddress?: AddressData;
}

const LocationService: React.FC<LocationServiceProps> = ({
  onAddressDetected, 
  currentAddress 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLocations');
    if (saved) {
      setRecentLocations(JSON.parse(saved));
    }
  }, []);

  // Save location to recent locations
  const saveToRecent = (location: string) => {
    const updated = [location, ...recentLocations.filter(loc => loc !== location)].slice(0, 5);
    setRecentLocations(updated);
    localStorage.setItem('recentLocations', JSON.stringify(updated));
  };

  // Get current location using GPS
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied. Please enable location services.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred while getting location.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
      });
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (
    latitude: number, 
    longitude: number
  ): Promise<AddressData> => {
    try {
      // Using OpenStreetMap Nominatim API (free and reliable)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }

        const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const address = data.address;
      
      // Extract address components
      const fullName = currentAddress?.fullName || '';
      const phone = currentAddress?.phone || '';
      
      // Build address string
      const addressParts = [];
      if (address.house_number) addressParts.push(address.house_number);
      if (address.road) addressParts.push(address.road);
      if (address.suburb) addressParts.push(address.suburb);
      if (address.neighbourhood) addressParts.push(address.neighbourhood);
      
      const addressString = addressParts.length > 0 
        ? addressParts.join(', ')
        : address.display_name?.split(', ').slice(0, 3).join(', ') || '';

      // Extract city, state, and pincode
      const city = address.city || 
                   address.town || 
                   address.village || 
                   address.county || 
                   'Unknown City';
      
      const state = address.state || 'Unknown State';
      
      const pincode = address.postcode || '';

      return {
        fullName,
        phone,
        address: addressString,
        city,
        state,
        pincode,
        landmark: address.landmark || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get address from location. Please enter manually.');
    }
  }, [currentAddress]);

  // Main function to detect location and get address
  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    setIsDetected(false);

    try {
      // Step 1: Get current GPS coordinates
      toast.info('Getting your current location...');
      const position = await getCurrentLocation();
      
      const { latitude, longitude } = position.coords;
      console.log('GPS Coordinates:', { latitude, longitude });

      // Step 2: Reverse geocode to get address
      toast.info('Converting location to address...');
      const addressData = await reverseGeocode(latitude, longitude);
      
      console.log('Detected Address:', addressData);

      // Step 3: Update the form
      onAddressDetected(addressData);
      setIsDetected(true);
      
      toast.success('Address detected successfully! Please review and edit if needed.');
      
    } catch (error) {
      console.error('Location detection error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to detect location');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, reverseGeocode, onAddressDetected]);

  // Get location suggestions using Nominatim
  const getSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Add India to the search to get more relevant results
      const searchQuery = `${input}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&accept-language=en&countrycodes=in`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        throw new Error('Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      toast.error('Failed to load location suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (input.trim()) {
      // Debounce the search to avoid too many API calls
      const timeout = setTimeout(() => {
        getSuggestions(input);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Location) => {
    const location = suggestion.display_name;
    saveToRecent(location);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
    toast.success('Location selected!');
  };

  // Handle recent location selection
  const handleRecentSelect = (location: string) => {
    saveToRecent(location);
    setShowSuggestions(false);
    toast.success('Recent location selected!');
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Auto-Detect Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Use your device's GPS to automatically fill in your delivery address. 
            This will use your current location to detect your address.
          </p>
          
          <div className="flex items-center gap-3">
        <Button
              onClick={detectLocation}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
        >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting Location...
                </>
          ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Detect My Location
                </>
          )}
        </Button>

            {isDetected && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Address Detected!</span>
              </div>
            )}
                </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy & Permissions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• This feature requires location permission from your browser</li>
                  <li>• Your location is only used to detect your address</li>
                  <li>• No location data is stored or shared</li>
                  <li>• You can always enter your address manually</li>
                </ul>
              </div>
              </div>
              </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationService; 