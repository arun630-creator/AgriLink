
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, Upload, Play, X } from 'lucide-react';

interface ProductVideo {
  id: string;
  url: string;
  title: string;
  duration: string;
  uploadDate: string;
}

interface ProductVideoUploadProps {
  videos: ProductVideo[];
  canUpload: boolean;
  onUploadVideo?: (video: File) => void;
  onDeleteVideo?: (videoId: string) => void;
}

const ProductVideoUpload = ({ videos, canUpload, onUploadVideo, onDeleteVideo }: ProductVideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadVideo) {
      setIsUploading(true);
      try {
        // In real implementation, upload to cloud storage
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
        onUploadVideo(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {canUpload && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Product Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Product Videos</h3>
                <p className="text-gray-600 mb-4">
                  Show your produce in action! Upload videos of your crops, harvesting process, or packaging.
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <p>• Max duration: 30 seconds</p>
                  <p>• Formats: MP4, MOV, AVI</p>
                  <p>• Max size: 50MB</p>
                </div>
                
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                <label htmlFor="video-upload">
                  <Button disabled={isUploading} asChild>
                    <span className="cursor-pointer">
                      {isUploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Video File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Video Tips for Better Sales:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Show the crop/produce in natural lighting</li>
                  <li>• Include harvesting or packaging process</li>
                  <li>• Display quantity and size up close</li>
                  <li>• Keep videos short and focused</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Gallery */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Product Videos ({videos.length})</span>
              <Badge variant="secondary">{videos.length}/5 videos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.duration} • {video.uploadDate}</p>
                    </div>
                    
                    {canUpload && onDeleteVideo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteVideo(video.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 && !canUpload && (
        <Card>
          <CardContent className="p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No videos available for this product</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductVideoUpload;
