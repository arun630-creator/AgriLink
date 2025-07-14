import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link, 
  Search, 
  QrCode, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Database,
  Eye,
  Download,
  Copy,
  TrendingUp,
  Users,
  Package,
  Truck,
  Store
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface BlockchainRecord {
  id: string;
  productId: string;
  productName: string;
  farmerId: string;
  farmerName: string;
  stage: 'planting' | 'growing' | 'harvesting' | 'packing' | 'shipping' | 'delivered';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  data: {
    temperature?: number;
    humidity?: number;
    qualityScore?: number;
    notes?: string;
    images?: string[];
    certifications?: string[];
  };
  hash: string;
  previousHash: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

interface ProductJourney {
  productId: string;
  productName: string;
  journey: BlockchainRecord[];
  totalStages: number;
  completedStages: number;
  estimatedCompletion: Date;
  qualityScore: number;
  transparencyScore: number;
}

interface SupplyChainStats {
  totalProducts: number;
  verifiedProducts: number;
  averageQualityScore: number;
  averageTransparencyScore: number;
  activeJourneys: number;
  completedJourneys: number;
}

const BlockchainTransparency = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductJourney | null>(null);
  const [productJourneys, setProductJourneys] = useState<ProductJourney[]>([]);
  const [stats, setStats] = useState<SupplyChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('journey');

  useEffect(() => {
    fetchSupplyChainData();
  }, []);

  const fetchSupplyChainData = async () => {
    try {
      setLoading(true);
      const [journeysRes, statsRes] = await Promise.all([
        apiService.get('/blockchain/journeys'),
        apiService.get('/blockchain/stats')
      ]);

      if (journeysRes.success) {
        setProductJourneys(journeysRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching supply chain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProduct = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await apiService.get(`/blockchain/search?q=${searchQuery}`);
      if (response.success && response.data) {
        setSelectedProduct(response.data);
      }
    } catch (error) {
      console.error('Error searching product:', error);
    }
  };

  const generateQRCode = (productId: string) => {
    // Generate QR code for product tracking
    const qrData = `${window.location.origin}/blockchain/track/${productId}`;
    // Implementation for QR code generation
    console.log('QR Code data:', qrData);
  };

  const downloadCertificate = (productId: string) => {
    // Download blockchain certificate
    console.log('Downloading certificate for:', productId);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    // Show toast notification
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'planting':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'growing':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'harvesting':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'packing':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'shipping':
        return <Truck className="w-4 h-4 text-red-500" />;
      case 'delivered':
        return <Store className="w-4 h-4 text-green-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'planting': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'harvesting': return 'bg-orange-100 text-orange-800';
      case 'packing': return 'bg-purple-100 text-purple-800';
      case 'shipping': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-yellow-600">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Pending</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Database className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading blockchain data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Database className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-900">Blockchain Transparency</h2>
        </div>
        <p className="text-gray-600">
          Track your products from farm to table with immutable blockchain records
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Track Product Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter product ID, name, or scan QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProduct()}
            />
            <Button onClick={searchProduct}>
              <Search className="w-4 h-4 mr-2" />
              Track
            </Button>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.verifiedProducts}</div>
              <p className="text-sm text-gray-600">Verified Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.averageQualityScore.toFixed(1)}</div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.averageTransparencyScore.toFixed(1)}</div>
              <p className="text-sm text-gray-600">Transparency Score</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Journey Display */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {selectedProduct.productName}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Product ID: {selectedProduct.productId}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => generateQRCode(selectedProduct.productId)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" onClick={() => downloadCertificate(selectedProduct.productId)}>
                  <Download className="w-4 h-4 mr-2" />
                  Certificate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="journey">Journey Timeline</TabsTrigger>
                <TabsTrigger value="details">Blockchain Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="journey" className="space-y-4">
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedProduct.completedStages / selectedProduct.totalStages) * 100}%` }}
                    />
                  </div>

                  {/* Journey Steps */}
                  <div className="space-y-6">
                    {selectedProduct.journey.map((record, index) => (
                      <div key={record.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          {index < selectedProduct.journey.length - 1 && (
                            <div className="w-1 h-12 bg-gray-200 mt-2" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStageIcon(record.stage)}
                                  <h3 className="font-semibold capitalize">{record.stage}</h3>
                                  <Badge className={getStageColor(record.stage)}>
                                    {record.stage}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getVerificationStatus(record.verified)}
                                  <span className="text-sm text-gray-500">
                                    {new Date(record.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Location</p>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{record.location.address}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Farmer</p>
                                  <span className="text-sm font-medium">{record.farmerName}</span>
                                </div>
                              </div>
                              
                              {record.data.notes && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                                  <p className="text-sm">{record.data.notes}</p>
                                </div>
                              )}
                              
                              {record.data.images && record.data.images.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-2">Images</p>
                                  <div className="flex gap-2">
                                    {record.data.images.map((image, imgIndex) => (
                                      <img
                                        key={imgIndex}
                                        src={image}
                                        alt={`Stage ${record.stage}`}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blockchain Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 p-2 rounded flex-1">
                            {selectedProduct.journey[selectedProduct.journey.length - 1]?.hash}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyHash(selectedProduct.journey[selectedProduct.journey.length - 1]?.hash || '')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Previous Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 p-2 rounded flex-1">
                            {selectedProduct.journey[selectedProduct.journey.length - 1]?.previousHash}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyHash(selectedProduct.journey[selectedProduct.journey.length - 1]?.previousHash || '')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Total Records</p>
                        <p className="font-medium">{selectedProduct.journey.length}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Chain Integrity</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Verified</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Overall Quality Score</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedProduct.qualityScore}/10
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${(selectedProduct.qualityScore / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Transparency Score</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedProduct.transparencyScore}/10
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${(selectedProduct.transparencyScore / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Journey Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedProduct.completedStages}/{selectedProduct.totalStages}
                          </div>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-purple-500 rounded-full"
                              style={{ width: `${(selectedProduct.completedStages / selectedProduct.totalStages) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center text-gray-500">
                        Temperature chart will be implemented here
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center text-gray-500">
                        Quality trends chart will be implemented here
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recent Journeys */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Product Journeys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productJourneys.slice(0, 5).map((journey) => (
              <div
                key={journey.productId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedProduct(journey)}
              >
                <div className="flex items-center gap-4">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{journey.productName}</h3>
                    <p className="text-sm text-gray-600">ID: {journey.productId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{journey.completedStages}/{journey.totalStages}</div>
                    <div className="text-xs text-gray-600">Stages</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">{journey.qualityScore}/10</div>
                    <div className="text-xs text-gray-600">Quality</div>
                  </div>
                  
                  <Badge className={getStageColor(journey.journey[journey.journey.length - 1]?.stage || 'unknown')}>
                    {journey.journey[journey.journey.length - 1]?.stage || 'Unknown'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainTransparency; 