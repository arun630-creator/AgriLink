const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Address = require('../models/Address');

// Get all addresses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
});

// Get a specific address by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json({ address });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Failed to fetch address' });
  }
});

// Create a new address
router.post('/', auth, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
      addressType,
      isDefault
    } = req.body;

    // Validation
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Phone number validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: 'Please enter a valid 10-digit Indian phone number' 
      });
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({ 
        message: 'Please enter a valid 6-digit pincode' 
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    const newAddress = new Address({
      userId: req.user.id,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });

    await newAddress.save();
    
    res.status(201).json({ 
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Failed to create address' });
  }
});

// Update an address
router.put('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const {
      fullName,
      phone,
      address: addressLine,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
      addressType,
      isDefault
    } = req.body;

    // Validation for provided fields
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Please enter a valid 10-digit Indian phone number' 
      });
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ 
        message: 'Please enter a valid 6-digit pincode' 
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    // Update fields
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (phone) updateFields.phone = phone;
    if (addressLine) updateFields.address = addressLine;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (pincode) updateFields.pincode = pincode;
    if (landmark !== undefined) updateFields.landmark = landmark;
    if (latitude !== undefined) updateFields.latitude = latitude;
    if (longitude !== undefined) updateFields.longitude = longitude;
    if (addressType) updateFields.addressType = addressType;
    if (isDefault !== undefined) updateFields.isDefault = isDefault;

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

// Delete an address (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Soft delete by setting isActive to false
    address.isActive = false;
    await address.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
});

// Set an address as default
router.patch('/:id/default', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other addresses as default
    await Address.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({ 
      message: 'Default address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
});

module.exports = router; 