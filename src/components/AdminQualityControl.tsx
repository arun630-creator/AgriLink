
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Flag, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FlaggedProduct {
  id: string;
  productId: string;
  productName: string;
  farmerName: string;
  flagCount: number;
  reasons: string[];
  status: 'pending' | 'reviewed' | 'resolved';
  flaggedDate: string;
}

interface RefundRequest {
  id: string;
  orderId: string;
  productName: string;
  buyerName: string;
  reason: string;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  amount: number;
}

const AdminQualityControl = () => {
  const [flaggedProducts, setFlaggedProducts] = useState<FlaggedProduct[]>([
    {
      id: '1',
      productId: 'prod-1',
      productName: 'Organic Tomatoes',
      farmerName: 'Ravi Kumar',
      flagCount: 3,
      reasons: ['Quality mismatch', 'Misleading photos', 'Price too high'],
      status: 'pending',
      flaggedDate: '2024-06-25'
    },
    {
      id: '2',
      productId: 'prod-2',
      productName: 'Fresh Spinach',
      farmerName: 'Priya Sharma',
      flagCount: 2,
      reasons: ['Quantity mismatch', 'Quality issues'],
      status: 'pending',
      flaggedDate: '2024-06-24'
    }
  ]);

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([
    {
      id: '1',
      orderId: 'ORD-001',
      productName: 'Organic Apples',
      buyerName: 'John Doe',
      reason: 'Product quality not as described',
      description: 'Received apples that were not fresh and had brown spots.',
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'],
      status: 'pending',
      submittedDate: '2024-06-26',
      amount: 240
    }
  ]);

  const [adminResponse, setAdminResponse] = useState('');

  const handleFlaggedProductAction = (flagId: string, action: 'resolve' | 'warn_farmer' | 'hide_product') => {
    setFlaggedProducts(prev => 
      prev.map(flag => 
        flag.id === flagId 
          ? { ...flag, status: action === 'resolve' ? 'resolved' : 'reviewed' }
          : flag
      )
    );
    
    const actionMessages = {
      resolve: 'Flagged product marked as resolved',
      warn_farmer: 'Warning sent to farmer',
      hide_product: 'Product hidden from marketplace'
    };
    
    toast.success(actionMessages[action]);
  };

  const handleRefundAction = (requestId: string, action: 'approve' | 'reject') => {
    setRefundRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
          : request
      )
    );
    
    toast.success(`Refund request ${action}d`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quality Control Center</h2>
        <p className="text-gray-600">Manage product flags, refund requests, and quality assurance</p>
      </div>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flagged" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Flagged Products ({flaggedProducts.filter(f => f.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Refund Requests ({refundRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Quality Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Community Flagged Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedProducts.map((flag) => (
                  <div key={flag.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{flag.productName}</h3>
                          <Badge className={getStatusColor(flag.status)}>
                            {flag.status}
                          </Badge>
                          <Badge variant="destructive">
                            {flag.flagCount} flags
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          by {flag.farmerName} • Flagged on {flag.flaggedDate}
                        </p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Reported Issues:</p>
                          <div className="flex flex-wrap gap-1">
                            {flag.reasons.map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Product
                      </Button>
                    </div>

                    {flag.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlaggedProductAction(flag.id, 'resolve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlaggedProductAction(flag.id, 'warn_farmer')}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warn Farmer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlaggedProductAction(flag.id, 'hide_product')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Hide Product
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {flaggedProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No flagged products to review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Buyer Protection Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {refundRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.productName}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant="outline">₹{request.amount}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Order {request.orderId} by {request.buyerName}
                        </p>
                        <p className="text-sm font-medium text-red-600 mb-2">
                          Reason: {request.reason}
                        </p>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {request.submittedDate}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Description:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {request.description}
                      </p>
                    </div>

                    {request.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Evidence Photos:</p>
                        <div className="flex gap-2">
                          {request.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt="Evidence"
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add admin notes/response..."
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRefundAction(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve Refund
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRefundAction(request.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject Request
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {refundRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No refund requests to review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Quality Assurance Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Quality Assured</h3>
                    <p className="text-sm text-gray-600 mb-2">95%+ positive feedback</p>
                    <Badge className="bg-purple-100 text-purple-800">12 farmers</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Verified Fresh</h3>
                    <p className="text-sm text-gray-600 mb-2">Consistently fresh produce</p>
                    <Badge className="bg-green-100 text-green-800">8 farmers</Badge>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Top Rated</h3>
                    <p className="text-sm text-gray-600 mb-2">4.8+ average rating</p>
                    <Badge className="bg-yellow-100 text-yellow-800">15 farmers</Badge>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Badge Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Quality Assured: 95%+ positive feedback + low complaint history</li>
                    <li>• Verified Fresh: Upload clear product images/videos</li>
                    <li>• Top Rated: 4.8+ average rating with 50+ reviews</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminQualityControl;
