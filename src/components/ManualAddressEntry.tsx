import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddressData {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface ManualAddressEntryProps {
  onAddressEntered: (address: AddressData) => void;
  currentAddress?: AddressData;
}

const ManualAddressEntry: React.FC<ManualAddressEntryProps> = ({ 
  onAddressEntered, 
  currentAddress 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AddressData>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Sync form data with currentAddress prop changes
  useEffect(() => {
    if (currentAddress) {
      setFormData({
        address: currentAddress.address || '',
        city: currentAddress.city || '',
        state: currentAddress.state || '',
        pincode: currentAddress.pincode || '',
        landmark: currentAddress.landmark || ''
      });
      
      // If we have address data, show it's been filled
      if (currentAddress.address || currentAddress.city || currentAddress.pincode) {
        setIsEditing(false);
      }
    }
  }, [currentAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields = ['address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof AddressData]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    onAddressEntered(formData);
    setIsEditing(false);
    toast.success('Address saved successfully!');
  };

  const handleCancel = () => {
    // Reset to current address data
    if (currentAddress) {
      setFormData({
        address: currentAddress.address || '',
        city: currentAddress.city || '',
        state: currentAddress.state || '',
        pincode: currentAddress.pincode || '',
        landmark: currentAddress.landmark || ''
      });
    } else {
      setFormData({
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      });
    }
    setIsEditing(false);
  };

  // Check if we have any address data
  const hasAddressData = currentAddress && (
    currentAddress.address || 
    currentAddress.city || 
    currentAddress.state || 
    currentAddress.pincode
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Delivery Address
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {hasAddressData ? 'Edit' : 'Add Address'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-address">Address *</Label>
              <Input
                id="manual-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="House/Flat No., Street, Area"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="manual-landmark">Landmark (Optional)</Label>
              <Input
                id="manual-landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Nearby landmark for easy delivery"
                className="mt-1"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="manual-city">City *</Label>
                <Input
                  id="manual-city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="manual-state">State *</Label>
                <Input
                  id="manual-state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="manual-pincode">Pincode *</Label>
                <Input
                  id="manual-pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Address
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {hasAddressData ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="space-y-2 text-sm">
                  <div><strong>Address:</strong> {currentAddress?.address || 'Not provided'}</div>
                  {currentAddress?.landmark && <div><strong>Landmark:</strong> {currentAddress.landmark}</div>}
                  <div><strong>City:</strong> {currentAddress?.city || 'Not provided'}</div>
                  <div><strong>State:</strong> {currentAddress?.state || 'Not provided'}</div>
                  <div><strong>Pincode:</strong> {currentAddress?.pincode || 'Not provided'}</div>
                </div>
                <div className="mt-2 text-xs text-green-600">
                  ✓ Address detected and filled automatically
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Edit3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No address entered yet</p>
                <p className="text-sm">Click "Add Address" to enter your delivery address manually</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualAddressEntry; 