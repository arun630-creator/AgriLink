import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Camera, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RefundRequest {
  id: string;
  orderId: string;
  productName: string;
  reason: string;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedDate: string;
  responseDate?: string;
  adminNotes?: string;
}

interface BuyerProtectionSystemProps {
  orderId?: string;
  productName?: string;
  canRequestRefund: boolean;
  existingRequest?: RefundRequest;
  onSubmitRefund?: (request: Partial<RefundRequest>) => void;
}

const BuyerProtectionSystem = ({ 
  orderId, 
  productName, 
  canRequestRefund, 
  existingRequest,
  onSubmitRefund 
}: BuyerProtectionSystemProps) => {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundRequest, setRefundRequest] = useState({
    reason: '',
    description: '',
    images: [] as string[]
  });

  const refundReasons = [
    'Product quality not as described',
    'Received damaged/spoiled produce',
    'Quantity mismatch',
    'Late delivery affecting freshness',
    'Product different from listing',
    'Packaging issues',
    'Other quality concerns'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In real implementation, upload to cloud storage
      const imageUrls = Array.from(files).map(() => 
        `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400`
      );
      setRefundRequest(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const handleSubmitRefund = () => {
    if (onSubmitRefund) {
      onSubmitRefund({
        orderId,
        productName,
        ...refundRequest,
        submittedDate: new Date().toISOString().split('T')[0]
      });
      setShowRefundForm(false);
      setRefundRequest({ reason: '', description: '', images: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Buyer Protection Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            Buyer Protection Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <span>24-hour quality guarantee - request refund if not satisfied</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <span>Upload photos as proof for faster processing</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <span>Full refund or replacement for quality issues</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <span>Admin review within 24 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Refund Request */}
      {existingRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Refund Request Status</span>
              <Badge className={getStatusColor(existingRequest.status)}>
                {getStatusIcon(existingRequest.status)}
                <span className="ml-1 capitalize">{existingRequest.status}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <p className="font-medium">{existingRequest.orderId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Product:</span>
                  <p className="font-medium">{existingRequest.productName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <p className="font-medium">{existingRequest.reason}</p>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <p className="font-medium">{existingRequest.submittedDate}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Description:</span>
                <p className="mt-1">{existingRequest.description}</p>
              </div>

              {existingRequest.images.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Evidence Photos:</span>
                  <div className="flex gap-2 mt-2">
                    {existingRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Evidence"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {existingRequest.adminNotes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600 text-sm">Admin Response:</span>
                  <p className="mt-1">{existingRequest.adminNotes}</p>
                  {existingRequest.responseDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Response Date: {existingRequest.responseDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund Request Form */}
      {canRequestRefund && !existingRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Issue? Request Refund</CardTitle>
          </CardHeader>
          <CardContent>
            {!showRefundForm ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Not satisfied with your order?</h3>
                <p className="text-gray-600 mb-4">
                  We guarantee the quality of our products. If you're not satisfied, 
                  request a refund within 24 hours of delivery.
                </p>
                <Button onClick={() => setShowRefundForm(true)} className="bg-red-600 hover:bg-red-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Request Refund
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Refund:</label>
                  <Select
                    value={refundRequest.reason}
                    onValueChange={(value) => setRefundRequest(prev => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detailed Description:</label>
                  <Textarea
                    placeholder="Please describe the issue in detail. This helps us process your request faster and improve our service."
                    value={refundRequest.description}
                    onChange={(e) => setRefundRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Evidence Photos:</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload photos showing the quality issue
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <label htmlFor="evidence-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Camera className="w-4 h-4 mr-2" />
                          Choose Photos
                        </span>
                      </Button>
                    </label>
                    {refundRequest.images.length > 0 && (
                      <div className="mt-3">
                        <Badge variant="secondary">{refundRequest.images.length} photos uploaded</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Before submitting:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Ensure photos clearly show the quality issue</li>
                        <li>• Provide detailed description of the problem</li>
                        <li>• Keep the product for verification if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitRefund}
                    disabled={!refundRequest.reason || !refundRequest.description}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Submit Refund Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRefundForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuyerProtectionSystem;
