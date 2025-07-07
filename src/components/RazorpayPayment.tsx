import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: string) => void;
  onPaymentCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  orderId,
  amount,
  currency = 'INR',
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive"
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Payment gateway not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // Create payment order on backend
      const response = await apiService.createPaymentOrder({
        amount,
        currency,
        orderId,
        description: `Farm to Table Bharat Order - ${orderId}`
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment order');
      }

      const { data } = response;

      // Configure Razorpay options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Farm to Table Bharat',
        description: `Order Payment - ${orderId}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            });

            if (verifyResponse.success) {
              setPaymentStatus('success');
              toast({
                title: "Payment Successful!",
                description: "Your order has been confirmed.",
                variant: "default"
              });
              onPaymentSuccess(verifyResponse.data);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            toast({
              title: "Payment Verification Failed",
              description: error instanceof Error ? error.message : 'Failed to verify payment',
              variant: "destructive"
            });
            onPaymentFailure(error instanceof Error ? error.message : 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || 'Test User',
          email: user?.email || 'test@example.com',
          contact: user?.phone || '9999999999'
        },
        notes: {
          orderId: orderId,
          source: 'Farm to Table Bharat'
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentStatus('idle');
            onPaymentCancel();
          }
        }
      };

      // Open Razorpay modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      setLoading(false);
      setPaymentStatus('failed');
      
      let errorMessage = 'Failed to initiate payment';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Handle specific authorization error
      if (errorMessage.includes('Not authorized') || errorMessage.includes('403')) {
        errorMessage = 'You are not authorized to pay for this order. Please make sure you are logged in with the correct account.';
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
      onPaymentFailure(errorMessage);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Processing Payment...';
      default:
        return 'Ready to Pay';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Secure Payment
        </CardTitle>
        <CardDescription>
          Pay securely with UPI, Cards, Net Banking, or Wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Order Amount:</span>
          <span className="text-lg font-bold">₹{amount.toFixed(2)}</span>
        </div>

        <div className="text-xs text-gray-600 text-center mb-2">
          This amount includes all taxes and delivery charges
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>100% Secure Payment</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">UPI</Badge>
          <Badge variant="secondary">Credit Card</Badge>
          <Badge variant="secondary">Debit Card</Badge>
          <Badge variant="secondary">Net Banking</Badge>
          <Badge variant="secondary">Wallets</Badge>
        </div>

        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Test Mode - No Real Charges
          </Badge>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || paymentStatus === 'processing'}
          className="w-full"
          size="lg"
        >
          {loading || paymentStatus === 'processing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>

        {paymentStatus !== 'idle' && (
          <div className="text-center">
            <p className="text-sm font-medium">{getStatusText()}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our terms and conditions
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment; 