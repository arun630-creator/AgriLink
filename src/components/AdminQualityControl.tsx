import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Flag, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

interface FlaggedProduct {
  _id: string;
  productId: string;
  productName: string;
  farmerName: string;
  flagCount: number;
  reasons: string[];
  status: 'pending' | 'reviewed' | 'resolved';
  flaggedDate: string;
}

interface RefundRequest {
  _id: string;
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
  const [flaggedProducts, setFlaggedProducts] = useState<FlaggedProduct[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingRefunds, setLoadingRefunds] = useState(true);
  const [errorFlags, setErrorFlags] = useState('');
  const [errorRefunds, setErrorRefunds] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  // Fetch flagged products
  useEffect(() => {
    const fetchFlags = async () => {
      setLoadingFlags(true);
      setErrorFlags('');
      try {
        const res = await apiService.get('/admin/produce/flags?status=pending');
        if (res.success) {
          setFlaggedProducts(res.data || []);
        } else {
          setErrorFlags(res.message || 'Failed to fetch flagged products');
        }
      } catch (err: any) {
        setErrorFlags(err.message || 'Failed to fetch flagged products');
      } finally {
        setLoadingFlags(false);
      }
    };
    fetchFlags();
  }, []);

  // Fetch refund requests
  useEffect(() => {
    const fetchRefunds = async () => {
      setLoadingRefunds(true);
      setErrorRefunds('');
      try {
        const res = await apiService.get('/admin/orders/refunds?status=pending');
        if (res.success) {
          setRefundRequests(res.data || []);
        } else {
          setErrorRefunds(res.message || 'Failed to fetch refund requests');
        }
      } catch (err: any) {
        setErrorRefunds(err.message || 'Failed to fetch refund requests');
      } finally {
        setLoadingRefunds(false);
      }
    };
    fetchRefunds();
  }, []);

  const handleFlaggedProductAction = async (flagId: string, action: 'resolve' | 'warn_farmer' | 'hide_product') => {
    let endpoint = `/admin/produce/flags/${flagId}/`;
    if (action === 'resolve') endpoint += 'resolve';
    if (action === 'warn_farmer') endpoint += 'warn';
    if (action === 'hide_product') endpoint += 'hide';
    try {
      await apiService.post(endpoint, { response: adminResponse });
      setFlaggedProducts(prev => prev.filter(flag => flag._id !== flagId));
      toast.success(`Flagged product ${action.replace('_', ' ')}d`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleRefundAction = async (requestId: string, action: 'approve' | 'reject') => {
    let endpoint = `/admin/orders/refunds/${requestId}/` + action;
    try {
      await apiService.post(endpoint, { response: adminResponse });
      setRefundRequests(prev => prev.filter(request => request._id !== requestId));
      toast.success(`Refund request ${action}d`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
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
              {loadingFlags ? (
                <div className="text-center py-8 text-gray-500">Loading flagged products...</div>
              ) : errorFlags ? (
                <div className="text-center py-8 text-red-500">{errorFlags}</div>
              ) : (
                <div className="space-y-4">
                  {flaggedProducts.map((flag) => (
                    <div key={flag._id} className="border rounded-lg p-4">
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
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlaggedProductAction(flag._id, 'resolve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlaggedProductAction(flag._id, 'warn_farmer')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Warn Farmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlaggedProductAction(flag._id, 'hide_product')}
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
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p>All flagged products have been reviewed!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Refund Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRefunds ? (
                <div className="text-center py-8 text-gray-500">Loading refund requests...</div>
              ) : errorRefunds ? (
                <div className="text-center py-8 text-red-500">{errorRefunds}</div>
              ) : (
                <div className="space-y-4">
                  {refundRequests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request.productName}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            by {request.buyerName} • Submitted on {request.submittedDate}
                          </p>
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Reason:</p>
                            <Badge variant="outline" className="text-xs">
                              {request.reason}
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Description:</p>
                            <span className="text-xs text-gray-700">{request.description}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {request.images && request.images.length > 0 && (
                            <img src={request.images[0]} alt="Refund" className="w-20 h-20 object-cover rounded" />
                          )}
                          <span className="text-xs text-gray-500 mt-2">Amount: ₹{request.amount}</span>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefundAction(request._id, 'approve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefundAction(request._id, 'reject')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {refundRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p>All refund requests have been processed!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Quality Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                {/* Implement quality badges integration here if needed */}
                Coming soon: Quality badge management for top farmers and products.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminQualityControl;
