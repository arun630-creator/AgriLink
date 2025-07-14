const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const Review = require('./backend/models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farm-to-table';

async function createTestReviews() {
  try {
    console.log('🚀 Creating test reviews...');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test buyer
    console.log('\n👤 Creating test buyer...');
    const buyerEmail = 'buyer@test.com';
    const buyerPassword = 'password123';
    const hashedPassword = await bcrypt.hash(buyerPassword, 10);

    let buyer = await User.findOne({ email: buyerEmail });
    if (!buyer) {
      buyer = new User({
        name: 'Test Buyer',
        email: buyerEmail,
        password: hashedPassword,
        phone: '9876543210',
        role: 'buyer',
        location: 'Mumbai, Maharashtra',
        isVerified: true
      });
      await buyer.save();
      console.log('✅ Created test buyer');
    } else {
      console.log('✅ Test buyer already exists');
    }

    // Find a product to review
    console.log('\n🍎 Finding product to review...');
    const product = await Product.findOne({ status: 'active' });
    if (!product) {
      console.log('❌ No active products found. Please create a product first.');
      process.exit(1);
    }
    console.log(`✅ Found product: ${product.name}`);

    // Create sample reviews
    console.log('\n⭐ Creating sample reviews...');
    
    const sampleReviews = [
      {
        product: product._id,
        user: buyer._id,
        rating: 5,
        comment: 'Excellent quality! The vegetables were fresh and delivered on time. Highly recommend this farmer!',
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
          count: 3,
          users: []
        }
      },
      {
        product: product._id,
        user: buyer._id,
        rating: 4,
        comment: 'Good quality produce. The packaging was excellent and everything arrived in perfect condition. Will order again!',
        images: [
          {
            url: '/uploads/reviews/sample-review-2.jpg',
            alt: 'Well packaged vegetables',
            uploadedAt: new Date()
          },
          {
            url: '/uploads/reviews/sample-review-3.jpg',
            alt: 'Quality check of vegetables',
            uploadedAt: new Date()
          }
        ],
        videos: [
          {
            url: '/uploads/reviews/sample-review-video.mp4',
            title: 'Unboxing the fresh vegetables',
            description: 'Quick video showing the quality of the delivered vegetables',
            duration: 30,
            uploadedAt: new Date()
          }
        ],
        verified: true,
        helpful: {
          count: 1,
          users: []
        }
      },
      {
        product: product._id,
        user: buyer._id,
        rating: 3,
        comment: 'Decent quality but delivery was a bit late. The vegetables were fresh though.',
        images: [],
        videos: [],
        verified: true,
        helpful: {
          count: 0,
          users: []
        }
      }
    ];

    // Clear existing reviews for this product
    await Review.deleteMany({ product: product._id });
    console.log('✅ Cleared existing reviews');

    // Create new reviews
    for (const reviewData of sampleReviews) {
      const review = new Review(reviewData);
      await review.save();
      console.log(`✅ Created review with rating ${reviewData.rating} stars`);
    }

    // Update product with review stats
    const reviews = await Review.find({ product: product._id });
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(product._id, {
      averageRating: averageRating,
      reviewCount: reviews.length
    });

    console.log(`\n✅ Successfully created ${reviews.length} reviews`);
    console.log(`📊 Product average rating: ${averageRating.toFixed(1)} stars`);
    console.log(`📝 Total reviews: ${reviews.length}`);

    console.log('\n🔗 Test the review system:');
    console.log(`1. Open product detail page for: ${product.name}`);
    console.log(`2. Scroll down to the Reviews section`);
    console.log(`3. You should see the sample reviews with ratings and comments`);
    console.log(`4. Try adding a new review with images/videos`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test reviews:', error);
    process.exit(1);
  }
}

createTestReviews(); 