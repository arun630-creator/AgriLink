import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { apiService, Address } from '@/lib/api';
import PincodeAddressService from '@/components/PincodeAddressService';
import MapPreview from '@/components/MapPreview';
import ManualAddressEntry from '@/components/ManualAddressEntry';
import PreviousAddresses from '@/components/PreviousAddresses';
import RazorpayPayment from '@/components/RazorpayPayment';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart, validateCartItems, removeInvalidItems } = useCart();
  
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined
    },
    paymentMethod: 'cod'
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [addressMethod, setAddressMethod] = useState<'saved' | 'pincode' | 'manual'>('saved');
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const deliveryFee = subtotal >= 500 ? 0 : 50;
    return subtotal + deliveryFee;
  };

  const calculateSubtotal = () => {
    return getTotalPrice();
  };

  const calculateDeliveryFee = () => {
    const subtotal = getTotalPrice();
    return subtotal >= 500 ? 0 : 50;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      deliveryAddress: {
        ...orderData.deliveryAddress,
        [name]: value
      }
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    setOrderData({
      ...orderData,
      paymentMethod: value
    });
  };

  // Handle saved address selection
  const handleSavedAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id);
    setOrderData({
      ...orderData,
      deliveryAddress: {
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude
      }
    });
    toast.success(`Address selected: ${address.city}, ${address.state}`);
  };

  // Handle pincode-detected address
  const handleAddressDetected = (addressData: any) => {
    console.log('Address detected:', addressData);
    
    const updatedAddress = {
      ...orderData.deliveryAddress,
      address: addressData.area || addressData.postOffice || '',
      city: addressData.city || '',
      state: addressData.state || '',
      pincode: addressData.pincode || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude
    };

    console.log('Updating delivery address:', updatedAddress);
    
    setOrderData({
      ...orderData,
      deliveryAddress: updatedAddress
    });

    // Show success message
    toast.success(`Address found: ${addressData.city}, ${addressData.state} ${addressData.pincode}`);
  };

  // Handle address detection errors
  const handleAddressError = (error: string) => {
    toast.error(error);
  };

  // Handle manually entered address
  const handleManualAddressEntered = (addressData: any) => {
    setOrderData({
      ...orderData,
      deliveryAddress: {
        ...orderData.deliveryAddress,
        ...addressData
      }
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, validate cart items
      console.log('Validating cart items...');
      const validation = await validateCartItems();
      
      if (!validation.valid) {
        console.log('Invalid cart items found:', validation.invalidItems);
        removeInvalidItems(validation.invalidItems);
        toast.error('Some items in your cart are no longer available and have been removed. Please review your cart and try again.');
        setLoading(false);
        return;
      }

      // Client-side validation
      const { deliveryAddress } = orderData;
      const requiredFields = [
        { field: 'fullName', value: deliveryAddress.fullName, label: 'Full Name' },
        { field: 'phone', value: deliveryAddress.phone, label: 'Phone Number' },
        { field: 'address', value: deliveryAddress.address, label: 'Address' },
        { field: 'city', value: deliveryAddress.city, label: 'City' },
        { field: 'state', value: deliveryAddress.state, label: 'State' },
        { field: 'pincode', value: deliveryAddress.pincode, label: 'Pincode' }
      ];

      const missingFields = requiredFields.filter(field => !field.value.trim());
      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(field => field.label).join(', ');
        toast.error(`Please fill in all required fields: ${missingFieldNames}`);
        setLoading(false);
        return;
      }

      // Validate phone number format (basic Indian phone validation)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(deliveryAddress.phone)) {
        toast.error('Please enter a valid 10-digit Indian phone number');
        setLoading(false);
        return;
      }

      // Validate pincode (6 digits)
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(deliveryAddress.pincode)) {
        toast.error('Please enter a valid 6-digit pincode');
        setLoading(false);
        return;
      }

      // Validate cart items have valid IDs
      const invalidItems = cartItems.filter(item => !item.id);
      if (invalidItems.length > 0) {
        toast.error('Some cart items have invalid product IDs. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderPayload = {
        items: cartItems.map(item => ({
          id: item.id, // Cart items only have 'id' field
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.quantity
        })),
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        notes: ''
      };

      // Debug: Log the form data and order payload
      console.log('Form data:', JSON.stringify(orderData, null, 2));
      console.log('Cart items:', JSON.stringify(cartItems, null, 2));
      console.log('Frontend sending order payload:', JSON.stringify(orderPayload, null, 2));

      // Create order
      const response = await apiService.createOrder(orderPayload);
      
      // If payment method is online, show payment component
      if (orderData.paymentMethod === 'online') {
        setCurrentOrder(response.order);
        setShowPayment(true);
        setLoading(false);
        return;
      }
      
      // For COD orders, proceed as before
      toast.success('Order placed successfully! Your delivery address has been saved for future orders.');
      clearCart(); // Clear the cart after successful order
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Show more detailed error information
      if (error.response && error.response.data) {
        console.error('Server response:', error.response.data);
        
        if (error.response.data.errors) {
          const errorMessages = error.response.data.errors.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
        } else if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to place order. Please try again.');
        }
      } else {
        toast.error(error.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData: any) => {
    toast.success('Payment successful! Your order has been confirmed.');
    clearCart();
    navigate('/orders');
  };

  // Handle payment failure
  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  // Handle payment cancel
  const handlePaymentCancel = () => {
    toast.info('Payment cancelled. You can try again or choose a different payment method.');
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center tracking-tight">Checkout</h1>
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Delivery & Address (2/3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Delivery Information */}
              <Card className="shadow-md rounded-2xl min-h-[220px] bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={orderData.deliveryAddress.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={orderData.deliveryAddress.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Section */}
              <Card className="shadow-md rounded-2xl bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Delivery Address</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your delivery address will be automatically saved for future orders
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address Method Selection */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      type="button"
                      variant={addressMethod === 'saved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAddressMethod('saved')}
                    >
                      Saved Addresses
                    </Button>
                    <Button
                      type="button"
                      variant={addressMethod === 'pincode' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAddressMethod('pincode')}
                    >
                      Find by Pincode
                    </Button>
                    <Button
                      type="button"
                      variant={addressMethod === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAddressMethod('manual')}
                    >
                      Enter Manually
                    </Button>
                  </div>

                  {/* Address Method Content */}
                  {addressMethod === 'saved' && (
                    <PreviousAddresses
                      onAddressSelect={handleSavedAddressSelect}
                      selectedAddressId={selectedAddressId}
                    />
                  )}

                  {addressMethod === 'pincode' && (
                    <PincodeAddressService 
                      onAddressDetected={handleAddressDetected}
                      onError={handleAddressError}
                    />
                  )}

                  {addressMethod === 'manual' && (
                    <ManualAddressEntry
                      onAddressEntered={handleManualAddressEntered}
                      currentAddress={orderData.deliveryAddress}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Address Found Preview (if available) */}
              {orderData.deliveryAddress.address && orderData.deliveryAddress.city && orderData.deliveryAddress.state && orderData.deliveryAddress.pincode && (
                <Card className="shadow rounded-xl border border-green-100 bg-green-50">
                  <CardContent className="flex items-center gap-4 py-4">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-green-900 text-base">Delivery Address</div>
                      <div className="text-green-700 text-sm mt-1">
                        {orderData.deliveryAddress.fullName} • {orderData.deliveryAddress.phone}
                      </div>
                      <div className="text-green-700 text-sm mt-1">
                        {orderData.deliveryAddress.address}, {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} - {orderData.deliveryAddress.pincode}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map Preview (if available) */}
              {orderData.deliveryAddress.latitude && orderData.deliveryAddress.longitude && (
                <Card className="shadow rounded-xl border border-blue-100 bg-blue-50">
                  <CardContent className="py-4">
                    <MapPreview
                      latitude={orderData.deliveryAddress.latitude}
                      longitude={orderData.deliveryAddress.longitude}
                      address={`${orderData.deliveryAddress.address}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} ${orderData.deliveryAddress.pincode}`}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card className="shadow-md rounded-2xl bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={orderData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1">
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-gray-500">Pay when you receive your order</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1">
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-gray-500">UPI, Cards, Net Banking, Wallets</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order Summary (1/3) */}
            <div className="flex flex-col h-full">
              <Card className="shadow-lg rounded-2xl bg-white border border-gray-100 h-fit min-h-[350px] lg:sticky lg:top-8">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {/* Cart Items */}
                  <div className={`${cartItems.length > 3 ? 'max-h-[200px] sm:max-h-[250px] lg:max-h-[300px] overflow-y-auto' : ''}`}>
                    {cartItems.map((item, index) => (
                      <div key={item.id} className={`flex justify-between items-start py-1 ${index < cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.quantity} {item.unit} × ₹{item.price}</div>
                          <div className="text-xs text-gray-400 truncate">by {item.farmer.name}</div>
                        </div>
                        <div className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total */}
                  <div className="border-t border-gray-200 mt-1 pt-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mt-1">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-green-600 font-medium">
                        {calculateDeliveryFee() === 0 ? 'Free' : `₹${calculateDeliveryFee().toFixed(2)}`}
                      </span>
                    </div>
                    {calculateDeliveryFee() > 0 && (
                      <div className="text-xs text-gray-500 text-center mt-1">
                        Free delivery on orders above ₹500
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-bold mt-2 pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Place Order Button */}
                  <Button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-lg font-semibold py-2 sm:py-3 rounded-xl shadow-md mt-3"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Payment Modal */}
        {showPayment && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <RazorpayPayment
                orderId={currentOrder._id}
                amount={currentOrder.total}
                currency="INR"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                onPaymentCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
