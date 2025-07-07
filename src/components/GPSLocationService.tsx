import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, MapPin, Navigation, Wifi, Globe, Search, X, Smartphone, Target, AlertCircle, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  locality?: string;
  accuracy?: number;
  source: 'native_gps' | 'browser_gps' | 'ip' | 'manual';
  timestamp: number;
  confidence?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface GPSLocationServiceProps {
  onLocationDetected: (location: LocationData) => void;
  onError: (error: string) => void;
}

const GPSLocationService: React.FC<GPSLocationServiceProps> = ({
  onLocationDetected,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'detecting' | 'manual' | 'success'>('detecting');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'available' | 'unavailable' | 'denied'>('checking');
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const locationWatcher = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize location detection on component mount
  useEffect(() => {
    detectLocation();
    return () => {
      // Cleanup location watcher
      if (locationWatcher.current) {
        navigator.geolocation.clearWatch(locationWatcher.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const detectLocation = async () => {
    setIsLoading(true);
    setCurrentStep('detecting');
    setGpsStatus('checking');

    try {
      // Step 1: Check if geolocation is supported
      if (!navigator.geolocation) {
        setGpsStatus('unavailable');
        await fallbackToIPLocation();
        return;
      }

      // Step 2: Check permission status
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'denied') {
            setGpsStatus('denied');
            setShowPermissionDialog(true);
            return;
          }
        } catch (error) {
          console.log('Permission API not supported, proceeding with location request');
        }
      }

      // Step 3: Try to get ultra-high-accuracy GPS location with sensor fusion
      const gpsLocation = await getGPSLocation();
      if (gpsLocation) {
        setLocationData(gpsLocation);
        setCurrentStep('success');
        onLocationDetected(gpsLocation);
        return;
      }

      // Step 4: Fallback to IP geolocation
      await fallbackToIPLocation();

    } catch (error) {
      console.error('Location detection error:', error);
      setCurrentStep('manual');
      onError('Location detection failed. Please enter your address manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const getGPSLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      let bestLocation: GeolocationPosition | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      const successCallback = (position: GeolocationPosition) => {
        console.log('GPS Position received:', {
          accuracy: position.coords.accuracy,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        });

        // Update accuracy display
        setAccuracy(position.coords.accuracy);

        // If this is our first location or it's more accurate than the previous one
        if (!bestLocation || position.coords.accuracy < bestLocation.coords.accuracy) {
          bestLocation = position;
        }

        // Simple accuracy criteria
        const isAccurateEnough = position.coords.accuracy <= 50 || attempts >= maxAttempts;

        if (isAccurateEnough) {
          if (bestLocation) {
            processGPSLocation(bestLocation).then(resolve);
          } else {
            resolve(null);
          }
          return;
        }

        attempts++;
        
        // Continue watching for better accuracy
        setTimeout(() => {
          if (locationWatcher.current) {
            navigator.geolocation.clearWatch(locationWatcher.current);
          }
          locationWatcher.current = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            options
          );
        }, 2000);
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.error('GPS Error:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsStatus('denied');
            toast.error('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsStatus('unavailable');
            toast.error('Location information unavailable. Please check your GPS settings.');
            break;
          case error.TIMEOUT:
            setGpsStatus('unavailable');
            toast.error('Location request timed out. Please try again.');
            break;
        }
        
        resolve(null);
      };

      // Start watching for location
      locationWatcher.current = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );

      // Set a timeout to stop trying after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (locationWatcher.current) {
          navigator.geolocation.clearWatch(locationWatcher.current);
        }
        if (bestLocation) {
          processGPSLocation(bestLocation).then(resolve);
        } else {
          resolve(null);
        }
      }, 30000);
    });
  };

  const processGPSLocation = async (position: GeolocationPosition): Promise<LocationData | null> => {
    try {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Use enhanced reverse geocoding with multiple services
      const address = await enhancedReverseGeocode(latitude, longitude);
      
      if (address) {
        const locationData: LocationData = {
          latitude,
          longitude,
          address: address.display_name,
          city: address.address.city || address.address.town || address.address.village || '',
          state: address.address.state || '',
          pincode: address.address.postcode || '',
          locality: address.address.suburb || address.address.neighbourhood || '',
          accuracy,
          source: 'browser_gps',
          timestamp: Date.now()
        };

        console.log('GPS Location Data created:', locationData);
        setGpsStatus('available');
        return locationData;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing GPS location:', error);
      return null;
    }
  };

  const enhancedReverseGeocode = async (lat: number, lng: number): Promise<any> => {
    // Try multiple reverse geocoding services for better accuracy
    const services = [
      // Primary: OpenStreetMap with detailed parameters for India (highest zoom)
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1&accept-language=en&countrycodes=in&extratags=1&namedetails=1`,
      // Secondary: OpenStreetMap with medium zoom for better locality detection
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en&countrycodes=in&extratags=1`,
      // Fallback: OpenStreetMap with different zoom level
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=en&countrycodes=in`,
      // Alternative: OpenStreetMap without country restriction
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`
    ];

    const results = [];

    // Try all services in parallel for faster response
    const promises = services.map(async (service, index) => {
      try {
        const response = await fetch(service, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'FarmToTableBharat/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.error) {
            return null;
          }

          // Enhanced address parsing for Indian addresses
          const enhancedAddress = enhanceAddressForIndia(data);
          return { data: enhancedAddress, priority: index };
        }
      } catch (error) {
        console.error(`Reverse geocoding service ${index + 1} failed:`, error);
        return null;
      }
    });

    try {
      const responses = await Promise.allSettled(promises);
      
      for (const response of responses) {
        if (response.status === 'fulfilled' && response.value) {
          results.push(response.value);
        }
      }

      // Sort by priority and return the best result
      results.sort((a, b) => a.priority - b.priority);
      
      if (results.length > 0) {
        console.log('Reverse geocoding results:', results);
        return results[0].data;
      }
    } catch (error) {
      console.error('All reverse geocoding services failed:', error);
    }
    
    return null;
  };

  const enhanceAddressForIndia = (data: any) => {
    const address = data.address;
    const displayName = data.display_name;
    const namedetails = data.namedetails || {};

    console.log('Raw address data:', data);
    console.log('Address object:', address);
    console.log('Display name:', displayName);
    console.log('Named details:', namedetails);

    // Enhanced city detection for Indian addresses with multiple fallbacks
    let city = '';
    const cityPriority = [
      address.city,
      address.town,
      address.village,
      address.district,
      address.county,
      address.municipality,
      address.suburb,
      address.neighbourhood
    ];

    for (const cityOption of cityPriority) {
      if (cityOption && typeof cityOption === 'string' && cityOption.trim()) {
        city = cityOption.trim();
        break;
      }
    }

    // If still no city, try parsing from display name with better logic
    if (!city) {
      const nameParts = displayName.split(', ');
      for (let i = 1; i < nameParts.length; i++) {
        const part = nameParts[i].trim();
        if (part && 
            !part.includes('State') && 
            !part.includes('India') && 
            !part.includes('District') &&
            !part.match(/^\d{6}$/) &&
            part.length > 2) {
          city = part;
          break;
        }
      }
    }

    // Enhanced state detection with better parsing
    let state = '';
    if (address.state) {
      state = address.state;
    } else if (address.province) {
      state = address.province;
    } else {
      const nameParts = displayName.split(', ');
      for (const part of nameParts) {
        if (part.includes('State') || part.includes('UT') || part.includes('Union Territory')) {
          state = part.replace(' State', '').replace(' UT', '').replace(' Union Territory', '');
          break;
        }
      }
    }

    // Enhanced pincode detection with validation
    let pincode = '';
    if (address.postcode) {
      pincode = address.postcode;
    } else {
      // Look for 6-digit numbers in display name
      const pincodeMatch = displayName.match(/\b\d{6}\b/);
      if (pincodeMatch) {
        pincode = pincodeMatch[0];
      }
    }

    // Validate pincode format
    if (pincode && !/^\d{6}$/.test(pincode)) {
      pincode = '';
    }

    // Enhanced address building with better structure
    const addressParts = [];
    
    // Add house/building details first
    if (address.house_number) addressParts.push(address.house_number);
    if (address.building) addressParts.push(address.building);
    if (address.house) addressParts.push(address.house);
    
    // Add street/road details
    if (address.road) addressParts.push(address.road);
    if (address.street) addressParts.push(address.street);
    if (address.lane) addressParts.push(address.lane);
    if (address.path) addressParts.push(address.path);
    
    // Add locality details
    if (address.neighbourhood) addressParts.push(address.neighbourhood);
    if (address.suburb) addressParts.push(address.suburb);
    if (address.quarter) addressParts.push(address.quarter);
    if (address.place) addressParts.push(address.place);

    let addressString = '';
    if (addressParts.length > 0) {
      addressString = addressParts.join(', ');
    } else {
      // Fallback: use first few parts of display name
      const nameParts = displayName.split(', ');
      const relevantParts = nameParts.slice(0, Math.min(4, nameParts.length));
      addressString = relevantParts.join(', ');
    }

    // Clean up address string
    addressString = addressString.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/\s*,$/, '');

    const enhancedData = {
      ...data,
      address: {
        ...address,
        city: city || 'Unknown City',
        state: state || 'Unknown State',
        postcode: pincode || '',
        enhanced_address: addressString || 'Address detected from GPS',
        confidence: calculateAddressConfidence(address, city, state, pincode)
      },
      display_name: addressString || displayName
    };

    console.log('Enhanced address data:', enhancedData);
    return enhancedData;
  };

  const calculateAddressConfidence = (address: any, city: string, state: string, pincode: string): number => {
    let confidence = 0;

    // Base confidence from address completeness
    if (address.house_number || address.building) confidence += 20;
    if (address.road || address.street) confidence += 20;
    if (address.neighbourhood || address.suburb) confidence += 15;
    if (city && city !== 'Unknown City') confidence += 20;
    if (state && state !== 'Unknown State') confidence += 15;
    if (pincode && pincode.length === 6) confidence += 10;

    return Math.min(confidence / 100, 1);
  };

  const fallbackToIPLocation = async (): Promise<void> => {
    try {
      const ipLocation = await getIPLocation();
      if (ipLocation) {
        setLocationData(ipLocation);
        setCurrentStep('success');
        onLocationDetected(ipLocation);
        return;
      }
    } catch (error) {
      console.error('IP geolocation failed:', error);
    }

    // If all automatic methods fail, show manual entry
    setCurrentStep('manual');
    onError('Could not detect your location automatically. Please enter manually.');
  };

  const getIPLocation = async (): Promise<LocationData | null> => {
    try {
      const services = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, { timeout: 5000 });
          if (response.ok) {
            const data = await response.json();
            
            if (data.latitude && data.longitude) {
              const address = await enhancedReverseGeocode(data.latitude, data.longitude);
              
              if (address) {
                return {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  address: address.display_name,
                  city: address.address.city || address.address.town || address.address.village || data.city || '',
                  state: address.address.state || data.region || '',
                  pincode: address.address.postcode || data.postal_code || '',
                  locality: address.address.suburb || address.address.neighbourhood || '',
                  source: 'ip' as const,
                  timestamp: Date.now()
                };
              }
            }
          }
        } catch (error) {
          console.error(`IP service ${service} failed:`, error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('IP geolocation error:', error);
      return null;
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const location: LocationData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || '',
      state: result.address?.state || '',
      pincode: result.address?.postcode || '',
      locality: result.address?.suburb || result.address?.neighbourhood || '',
      source: 'manual' as const,
      timestamp: Date.now()
    };

    setLocationData(location);
    setSearchResults([]);
    setSearchQuery('');
    setCurrentStep('success');
    onLocationDetected(location);
  };

  const handleManualSubmit = () => {
    if (!manualAddress.address || !manualAddress.city || !manualAddress.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    const location: LocationData = {
      latitude: 20.5937, // Default to India center
      longitude: 78.9629,
      address: manualAddress.address,
      city: manualAddress.city,
      state: manualAddress.state,
      pincode: manualAddress.pincode,
      source: 'manual' as const,
      timestamp: Date.now()
    };

    setLocationData(location);
    setCurrentStep('success');
    onLocationDetected(location);
  };

  const retryDetection = () => {
    setCurrentStep('detecting');
    setAccuracy(null);
    detectLocation();
  };

  if (currentStep === 'detecting') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Detecting Your Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPermissionDialog ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Location Permission Required</span>
                </div>
                <p className="text-sm text-amber-600 mb-3">
                  To provide accurate delivery location, we need access to your device's GPS.
                </p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>• Uses GPS for precise location detection</p>
                  <p>• Only used for delivery address</p>
                  <p>• Your privacy is protected</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowPermissionDialog(false);
                    detectLocation();
                  }}
                  className="flex-1"
                >
                  Allow Location Access
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPermissionDialog(false);
                    setCurrentStep('manual');
                  }}
                  className="flex-1"
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Detecting your location...</span>
                </div>
                
                {gpsStatus === 'checking' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Getting your precise location
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Wifi className="h-3 w-3" />
                      <span>Wi-Fi + GPS</span>
                    </div>
                  </div>
                )}

                {gpsStatus === 'available' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>Location detected</span>
                    </div>
                  </div>
                )}

                {gpsStatus === 'denied' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Location Access Denied</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Please enable location access in your browser settings
                    </p>
                  </div>
                )}

                {accuracy && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-700">GPS Accuracy</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        accuracy <= 10 ? 'bg-green-100 text-green-800' :
                        accuracy <= 20 ? 'bg-blue-100 text-blue-800' :
                        accuracy <= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {accuracy <= 10 ? 'Excellent' : 
                         accuracy <= 20 ? 'Good' : 
                         accuracy <= 50 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Accuracy: ±{Math.round(accuracy)} meters
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'success' && locationData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Location Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800">{locationData.address}</p>
                <p className="text-sm text-green-600 mt-1">
                  {locationData.city}, {locationData.state} {locationData.pincode}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-green-500">
                  <span>Source: {locationData.source.replace('_', ' ').toUpperCase()}</span>
                  {locationData.accuracy && (
                    <span>• Accuracy: ±{Math.round(locationData.accuracy)}m</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('manual')}
              className="flex-1"
            >
              Change Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retryDetection}
              className="flex-1"
            >
              Retry Detection
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
          Enter Your Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Location */}
        <div className="space-y-2">
          <Label htmlFor="search">Search for your location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search for area, street, landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0"
                >
                  <p className="font-medium text-sm">{result.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.address?.city || result.address?.town || result.address?.village}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
          </div>
        </div>

        {/* Manual Address Entry */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Input
              id="address"
              placeholder="House/Flat number, Street, Area"
              value={manualAddress.address}
              onChange={(e) => setManualAddress(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={manualAddress.city}
                onChange={(e) => setManualAddress(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={manualAddress.state}
                onChange={(e) => setManualAddress(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
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
            onClick={retryDetection}
            className="flex-1"
          >
            Retry Auto-Detection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSLocationService; 