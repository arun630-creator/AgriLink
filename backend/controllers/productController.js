const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      unit,
      minOrderQuantity,
      maxOrderQuantity,
      quantity,
      organic,
      certifications,
      qualityGrade,
      harvestDate,
      expiryDate,
      shelfLife,
      farmName,
      farmLocation,
      availableLocations,
      deliveryRadius,
      deliveryTime,
      isFeatured,
      isSeasonal,
      tags,
      searchKeywords
    } = req.body;

    // Get farmer information from authenticated user
    const farmer = await User.findById(req.user.id);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can create products'
      });
    }

    // Create the product
    const product = new Product({
      name,
      description,
      category,
      subcategory,
      price,
      unit,
      minOrderQuantity: minOrderQuantity || 1,
      maxOrderQuantity,
      quantity,
      organic: organic || false,
      certifications: certifications || [],
      qualityGrade: qualityGrade || 'Standard',
      harvestDate,
      expiryDate,
      shelfLife,
      farmer: req.user.id,
      farmName: farmName || farmer.farmName,
      farmLocation: farmLocation || farmer.farmLocation,
      availableLocations: availableLocations || [farmer.location],
      deliveryRadius: deliveryRadius || 50,
      deliveryTime: deliveryTime || 24,
      isFeatured: isFeatured || false,
      isSeasonal: isSeasonal || false,
      tags: tags || [],
      searchKeywords: searchKeywords || []
    });

    await product.save();

    // Populate farmer information
    await product.populate('farmer', 'name email phone location farmName');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Get all products with filtering and pagination
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = 'active',
      organic,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      farmer
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Organic filter
    if (organic !== undefined) {
      query.organic = organic === 'true';
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Farmer filter
    if (farmer) {
      query.farmer = farmer;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('farmer', 'name location farmName rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Map _id to id for frontend compatibility
    const mappedProducts = products.map(product => ({
      ...product,
      id: product._id,
      farmer: product.farmer ? {
        ...product.farmer,
        id: product.farmer._id
      } : product.farmer
    }));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      products: mappedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get a single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('farmer', 'name email phone location farmName rating joinDate')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Map _id to id for frontend compatibility
    const mappedProduct = {
      ...product,
      id: product._id,
      farmer: product.farmer ? {
        ...product.farmer,
        id: product.farmer._id
      } : product.farmer
    };

    // Increment view count (need to do this separately since we're using lean())
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      product: mappedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.farmer.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('farmer', 'name email phone location farmName');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.farmer.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    // Delete product images from filesystem
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '..', 'uploads', 'products', path.basename(image.url));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Update product status (for admin approval)
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update product status'
      });
    }

    // Find and update the product
    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('farmer', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product status updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: error.message
    });
  }
};

// Upload product images
const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.farmer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload images for your own products'
      });
    }

    // Process uploaded images
    const imageUrls = [];
    for (const file of files) {
      const imageUrl = `/uploads/products/${file.filename}`;
      imageUrls.push({
        url: imageUrl,
        alt: file.originalname,
        isPrimary: product.images.length === 0 // First image is primary
      });
    }

    // Add new images to product
    product.images.push(...imageUrls);
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('Error uploading product images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Delete product image
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.farmer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete images from your own products'
      });
    }

    // Find the image
    const image = product.images.id(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete image from filesystem
    const imagePath = path.join(__dirname, '..', 'uploads', 'products', path.basename(image.url));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove image from product
    product.images.pull(imageId);
    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Get farmer's products
const getFarmerProducts = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 12, status } = req.query;

    const query = { farmer: farmerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate('farmer', 'name location farmName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer products',
      error: error.message
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({
      status: 'active',
      isFeatured: true,
      quantity: { $gt: 0 }
    })
      .populate('farmer', 'name location farmName rating')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q, category, organic, minPrice, maxPrice, sortBy = 'relevance' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search query
    const query = {
      status: 'active',
      quantity: { $gt: 0 },
      $text: { $search: q }
    };

    if (category) query.category = category;
    if (organic !== undefined) query.organic = organic === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      default:
        sort = { score: { $meta: 'textScore' } };
    }

    const products = await Product.find(query)
      .populate('farmer', 'name location farmName rating')
      .sort(sort)
      .limit(20)
      .lean();

    res.json({
      success: true,
      products,
      query: q
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  uploadProductImages,
  deleteProductImage,
  getFarmerProducts,
  getFeaturedProducts,
  searchProducts
}; 