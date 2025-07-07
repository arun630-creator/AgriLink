import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  address: string;
}

const MapPreview: React.FC<MapPreviewProps> = ({ latitude, longitude, address }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">{address}</p>
          <p className="text-xs text-blue-600 mt-1">
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
        
        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            title="Location Map"
            className="absolute inset-0"
          />
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Map powered by OpenStreetMap
        </div>
      </CardContent>
    </Card>
  );
};

export default MapPreview; 