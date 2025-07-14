const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const Review = require('./backend/models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farm-to-table';

async function addSampleReview() {
  try {
    console.log('🚀 Adding sample review...');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an existing user (buyer)
    console.log('\n👤 Finding existing user...');
    const user = await User.findOne({ role: 'buyer' });
    if (!user) {
      console.log('❌ No buyer found. Please create a buyer account first.');
      process.exit(1);
    }
    console.log(`✅ Found user: ${user.name}`);

    // Find a product
    console.log('\n🍎 Finding product...');
    const product = await Product.findOne({ status: 'active' });
    if (!product) {
      console.log('❌ No active products found.');
      process.exit(1);
    }
    console.log(`✅ Found product: ${product.name}`);

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ 
      product: product._id, 
      user: user._id 
    });
    
    if (existingReview) {
      console.log('✅ User already reviewed this product');
      console.log(`📊 Current review: ${existingReview.rating} stars - "${existingReview.comment}"`);
      process.exit(0);
    }

    // Create a sample review
    console.log('\n⭐ Creating sample review...');
    const review = new Review({
      product: product._id,
      user: user._id,
      rating: 5,
      comment: 'Excellent quality! The vegetables were fresh and delivered on time. Highly recommend this farmer! The packaging was perfect and everything arrived in great condition.',
      images: [
        {
          url: '/uploads/reviews/sample-review-1.jpg',
          alt: 'Fresh vegetables from delivery',
          uploadedAt: new Date()
        }
      ],
      videos: [],
      verified: true,
      helpful: {
        count: 2,
        users: []
      }
    });

    await review.save();
    console.log('✅ Sample review created successfully!');

    // Update product stats
    const allReviews = await Review.find({ product: product._id });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(product._id, {
      averageRating: averageRating,
      reviewCount: allReviews.length
    });

    console.log(`\n📊 Updated product stats:`);
    console.log(`   Average rating: ${averageRating.toFixed(1)} stars`);
    console.log(`   Total reviews: ${allReviews.length}`);

    console.log('\n🔗 Test the review system:');
    console.log(`1. Open product detail page for: ${product.name}`);
    console.log(`2. Scroll down to the Reviews section`);
    console.log(`3. You should see the sample review with 5 stars`);
    console.log(`4. Try adding another review with different rating`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample review:', error);
    process.exit(1);
  }
}

addSampleReview(); 