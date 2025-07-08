const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const AdminAction = require('../../models/AdminAction');
const roleCheck = require('../../middlewares/roleCheck');

// Placeholder for pricing management routes
// Will be implemented in Phase 3

router.get('/', (req, res) => {
  res.json({ message: 'Pricing management routes - to be implemented in Phase 3' });
});

// 1. List all regional prices (optionally filter by region)
router.get('/regional-pricing', roleCheck('super_admin', 'pricing_manager'), async (req, res) => {
  try {
    const { region } = req.query;
    let query = {};
    if (region) {
      query['regionalPricing.region'] = region;
    }
    const products = await Product.find(query, 'name regionalPricing category farmer');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching regional pricing', error: error.message });
  }
});

// 2. Update regional pricing for a product
router.post('/:id/regional-pricing', roleCheck('super_admin', 'pricing_manager'), async (req, res) => {
  try {
    const { regionalPricing } = req.body; // [{ region, price, currency }]
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const oldPricing = product.regionalPricing;
    product.regionalPricing = regionalPricing;
    await product.save();
    // Log admin action
    await AdminAction.logAction({
      admin: req.user.id,
      action: 'price_update',
      targetType: 'product',
      targetId: product._id,
      targetModel: 'Product',
      details: { before: { regionalPricing: oldPricing }, after: { regionalPricing }, reason: req.body.reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      location: req.user.location || '',
      status: 'success'
    });
    res.json({ success: true, message: 'Regional pricing updated', data: product.regionalPricing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating regional pricing', error: error.message });
  }
});

// 3. List all regions in use
router.get('/regions', roleCheck('super_admin', 'pricing_manager'), async (req, res) => {
  try {
    const regions = await Product.distinct('regionalPricing.region');
    res.json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching regions', error: error.message });
  }
});

module.exports = router; 