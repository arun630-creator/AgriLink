import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Wallet, Shield, CheckCircle, AlertCircle, Lock, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { apiService, AddPaymentMethodData, PaymentMethod } from "@/lib/api";
import { UPIIcon, PaytmIcon, GooglePayIcon, PhonePeIcon, getCardTypeIcon } from "./PaymentIcons";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editPaymentMethod?: PaymentMethod;
}

// Validation functions
const validateCardNumber = (number: string): { isValid: boolean; message: string } => {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length === 0) {
    return { isValid: false, message: 'Card number is required' };
  }
  if (cleaned.length < 16) {
    return { isValid: false, message: 'Card number must be 16 digits' };
  }
  if (cleaned.length > 16) {
    return { isValid: false, message: 'Card number cannot exceed 16 digits' };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, message: 'Card number must contain only digits' };
  }
  return { isValid: true, message: '' };
};

const validateExpiryDate = (date: string): { isValid: boolean; message: string } => {
  if (!date) {
    return { isValid: false, message: 'Expiry date is required' };
  }
  if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(date)) {
    return { isValid: false, message: 'Use MM/YY format (e.g., 12/25)' };
  }
  
  const [month, year] = date.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, message: 'Card has expired' };
  }
  
  return { isValid: true, message: '' };
};

const validateCVV = (cvv: string): { isValid: boolean; message: string } => {
  if (!cvv) {
    return { isValid: false, message: 'CVV is required' };
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, message: 'CVV must be 3 or 4 digits' };
  }
  return { isValid: true, message: '' };
};

const validateUPIId = (upiId: string): { isValid: boolean; message: string } => {
  if (!upiId) {
    return { isValid: false, message: 'UPI ID is required' };
  }
  if (upiId.length < 3) {
    return { isValid: false, message: 'UPI ID must be at least 3 characters' };
  }
  if (upiId.length > 50) {
    return { isValid: false, message: 'UPI ID must be less than 50 characters' };
  }
  return { isValid: true, message: '' };
};

const validatePhoneNumber = (phone: string): { isValid: boolean; message: string } => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { isValid: false, message: 'Phone number must be 10 digits starting with 6-9' };
  }
  return { isValid: true, message: '' };
};

const PaymentMethodDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editPaymentMethod 
}: PaymentMethodDialogProps) => {
  const [activeTab, setActiveTab] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'card' as const,
    name: '',
    number: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    walletType: 'paytm' as const,
    phone: ''
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    number: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    phone: ''
  });

  useEffect(() => {
    if (editPaymentMethod) {
      // For editing, we need to handle the data differently
      const editData = {
        type: editPaymentMethod.type,
        name: editPaymentMethod.name,
        number: '', // We don't have the full card number, so leave empty
        expiryDate: editPaymentMethod.expiryDate || '',
        cvv: '',
        upiId: editPaymentMethod.upiId || '',
        walletType: editPaymentMethod.walletType || 'paytm',
        phone: editPaymentMethod.phone || ''
      };
      
      setFormData(editData);
      setActiveTab(editPaymentMethod.type);
    } else {
      setFormData({
        type: 'card',
        name: '',
        number: '',
        expiryDate: '',
        cvv: '',
        upiId: '',
        walletType: 'paytm',
        phone: ''
      });
      setActiveTab('card');
    }
    // Clear validation errors when dialog opens
    setValidationErrors({
      name: '',
      number: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      phone: ''
    });
  }, [editPaymentMethod, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    
    // Real-time validation for specific fields
    if (field === 'number') {
      const validation = validateCardNumber(value);
      setValidationErrors(prev => ({ ...prev, number: validation.isValid ? '' : validation.message }));
    } else if (field === 'expiryDate') {
      const validation = validateExpiryDate(value);
      setValidationErrors(prev => ({ ...prev, expiryDate: validation.isValid ? '' : validation.message }));
    } else if (field === 'cvv') {
      const validation = validateCVV(value);
      setValidationErrors(prev => ({ ...prev, cvv: validation.isValid ? '' : validation.message }));
    } else if (field === 'upiId') {
      const validation = validateUPIId(value);
      setValidationErrors(prev => ({ ...prev, upiId: validation.isValid ? '' : validation.message }));
    } else if (field === 'phone') {
      const validation = validatePhoneNumber(value);
      setValidationErrors(prev => ({ ...prev, phone: validation.isValid ? '' : validation.message }));
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      number: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      phone: ''
    };

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Payment method name is required';
    }

    // Validate based on payment type
    if (formData.type === 'card') {
      // For editing, card number is optional if not provided
      if (formData.number) {
        const numberValidation = validateCardNumber(formData.number);
        if (!numberValidation.isValid) errors.number = numberValidation.message;
      }
      
      const expiryValidation = validateExpiryDate(formData.expiryDate);
      if (!expiryValidation.isValid) errors.expiryDate = expiryValidation.message;
      
      // CVV is only required for new cards, not for editing
      if (!editPaymentMethod && formData.cvv) {
        const cvvValidation = validateCVV(formData.cvv);
        if (!cvvValidation.isValid) errors.cvv = cvvValidation.message;
      }
    } else if (formData.type === 'upi') {
      const upiValidation = validateUPIId(formData.upiId);
      if (!upiValidation.isValid) errors.upiId = upiValidation.message;
    } else if (formData.type === 'wallet') {
      const phoneValidation = validatePhoneNumber(formData.phone);
      if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsLoading(true);
    try {
      const paymentData: AddPaymentMethodData = {
        type: formData.type,
        name: formData.name,
      };

      if (formData.type === 'card') {
        // Only include card number if provided (for editing)
        if (formData.number) {
          paymentData.number = formData.number;
        }
        paymentData.expiryDate = formData.expiryDate;
        // Only include CVV for new cards
        if (!editPaymentMethod && formData.cvv) {
          paymentData.cvv = formData.cvv;
        }
      } else if (formData.type === 'upi') {
        paymentData.upiId = formData.upiId;
      } else if (formData.type === 'wallet') {
        paymentData.walletType = formData.walletType;
        paymentData.phone = formData.phone;
      }

      console.log('Sending payment data:', paymentData);
      if (editPaymentMethod) {
        await apiService.updatePaymentMethod(editPaymentMethod.id, paymentData);
        toast.success("Payment method updated successfully");
      } else {
        await apiService.addPaymentMethod(paymentData);
        toast.success("Payment method added successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      const errorMessage = error.message || "Failed to save payment method";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'upi':
        return <Smartphone className="h-6 w-6" />;
      case 'wallet':
        return <Wallet className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentTitle = (type: string) => {
    switch (type) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return 'Payment Method';
    }
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'paytm':
        return <PaytmIcon />;
      case 'gpay':
        return <GooglePayIcon />;
      case 'phonepe':
        return <PhonePeIcon />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              {getPaymentIcon(activeTab)}
            </div>
            <div>
              <div>{editPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}</div>
              <div className="text-sm font-normal text-gray-500">
                Secure and encrypted payment processing
              </div>
            </div>
          </DialogTitle>
          
          {/* Security Badge */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Your payment information is encrypted and secure
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <span>Payment Method Name</span>
                <span className="text-gray-400 text-xs">(for your reference)</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., My VISA Card, Personal UPI, Work Paytm"
                className={`mt-1 font-medium text-lg transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                  validationErrors.name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {validationErrors.name && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <XCircle className="h-3 w-3" />
                  {validationErrors.name}
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
                <TabsTrigger 
                  value="card" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Card</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upi" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">UPI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Wallet</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    {getCardTypeIcon(formData.number)}
                    <div>
                      <h3 className="font-semibold text-gray-800">Credit/Debit Card</h3>
                      <p className="text-sm text-gray-600">Secure card payment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm font-semibold flex items-center gap-2">
                        <span>Card Number</span>
                        <Lock className="h-3 w-3 text-gray-400" />
                      </Label>
                      <Input
                        id="cardNumber"
                        value={formData.number}
                        onChange={(e) => handleInputChange("number", formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`mt-1 font-mono text-lg tracking-wider transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                          validationErrors.number 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'focus:border-blue-500 focus:ring-blue-200'
                        }`}
                      />
                      {validationErrors.number && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                          <XCircle className="h-3 w-3" />
                          {validationErrors.number}
                        </div>
                      )}
                      {editPaymentMethod && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                          <Info className="h-3 w-3" />
                          <span>Leave empty to keep existing card number</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-semibold">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`mt-1 font-mono text-lg tracking-wider transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                            validationErrors.expiryDate 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                              : 'focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        />
                        {validationErrors.expiryDate && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                            <XCircle className="h-3 w-3" />
                            {validationErrors.expiryDate}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm font-semibold flex items-center gap-2">
                          <span>CVV</span>
                          <Lock className="h-3 w-3 text-gray-400" />
                        </Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                          className={`mt-1 font-mono text-lg tracking-wider transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                            validationErrors.cvv 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                              : 'focus:border-blue-500 focus:ring-blue-200'
                          }`}
                        />
                        {validationErrors.cvv && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                            <XCircle className="h-3 w-3" />
                            {validationErrors.cvv}
                          </div>
                        )}
                        {editPaymentMethod && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                            <Info className="h-3 w-3" />
                            <span>CVV not required for updates</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upi" className="space-y-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <UPIIcon />
                    <div>
                      <h3 className="font-semibold text-gray-800">UPI Payment</h3>
                      <p className="text-sm text-gray-600">Instant bank transfers</p>
                    </div>
                  </div>
                
                  <div>
                    <Label htmlFor="upiId" className="text-sm font-semibold">UPI ID</Label>
                    <Input
                      id="upiId"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                      placeholder="username@upi"
                      className={`mt-1 font-medium text-lg transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                        validationErrors.upiId 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'focus:border-green-500 focus:ring-green-200'
                      }`}
                    />
                    {validationErrors.upiId && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                        <XCircle className="h-3 w-3" />
                        {validationErrors.upiId}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Examples: username@upi, username@okicici, username@paytm</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3 mb-4">
                    {getWalletIcon(formData.walletType)}
                    <div>
                      <h3 className="font-semibold text-gray-800">Digital Wallet</h3>
                      <p className="text-sm text-gray-600">Quick mobile payments</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="walletType" className="text-sm font-semibold">Wallet Type</Label>
                      <Select 
                        value={formData.walletType} 
                        onValueChange={(value) => handleInputChange("walletType", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paytm">
                            <div className="flex items-center gap-2">
                              <PaytmIcon />
                              <span>Paytm</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="gpay">
                            <div className="flex items-center gap-2">
                              <GooglePayIcon />
                              <span>Google Pay</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="phonepe">
                            <div className="flex items-center gap-2">
                              <PhonePeIcon />
                              <span>PhonePe</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`mt-1 font-mono text-lg tracking-wider transition-all duration-300 ease-in-out focus:scale-[1.02] focus:shadow-lg ${
                          validationErrors.phone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                            : 'focus:border-orange-500 focus:ring-orange-200'
                        }`}
                      />
                      {validationErrors.phone && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                          <XCircle className="h-3 w-3" />
                          {validationErrors.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span>Enter the phone number linked to your wallet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editPaymentMethod ? "Update Payment Method" : "Add Payment Method"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDialog; 