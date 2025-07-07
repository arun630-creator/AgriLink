import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  className?: string;
}

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt';

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  className = ""
}) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }

    // Check current permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          setPermissionStatus(permissionStatus.state as PermissionStatus);
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state as PermissionStatus);
          };
        })
        .catch(() => {
          setPermissionStatus('unknown');
        });
    } else {
      setPermissionStatus('unknown');
    }
  }, []);

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      onPermissionDenied();
      return;
    }

    setIsRequesting(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      setPermissionStatus('granted');
      onPermissionGranted();
      toast.success('Location permission granted!');
    } catch (error) {
      console.error('Permission request error:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermissionStatus('denied');
            onPermissionDenied();
            toast.error('Location permission denied. You can enable it later in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('Failed to get your location.');
        }
      } else {
        toast.error('Failed to get your location.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'prompt':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Location access granted';
      case 'denied':
        return 'Location access denied';
      case 'prompt':
        return 'Location permission needed';
      default:
        return 'Location permission unknown';
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'prompt':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          Location Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium text-gray-900">{getStatusText()}</p>
              <p className="text-sm text-gray-600">
                We use your location to provide better service and recommendations
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor()} border`}>
            {permissionStatus.toUpperCase()}
          </Badge>
        </div>

        {permissionStatus === 'unknown' || permissionStatus === 'prompt' ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Your privacy is important to us</p>
                  <p>We only use your location to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Show nearby farmers and products</li>
                    <li>Provide accurate delivery estimates</li>
                    <li>Suggest relevant local deals</li>
                    <li>Improve your shopping experience</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    Your location data is never shared with third parties and is only used when you explicitly allow it.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={requestPermission}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting Permission...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Enable Location Access
                </>
              )}
            </Button>
          </div>
        ) : permissionStatus === 'denied' ? (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Location access is currently disabled</p>
                  <p>To enable location services:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Click the lock/info icon in your browser's address bar</li>
                    <li>Find "Location" in the permissions list</li>
                    <li>Change it from "Block" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button
              onClick={requestPermission}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Location services are enabled!</p>
                <p>You can now use GPS features and get location-based recommendations.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationPermission; 