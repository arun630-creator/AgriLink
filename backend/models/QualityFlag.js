const mongoose = require('mongoose');

const qualityFlagSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flagType: {
    type: String,
    enum: [
      'quality_mismatch',
      'misleading_photos',
      'price_inflation',
      'quantity_mismatch',
      'expired_product',
      'pesticide_residue',
      'organic_fraud',
      'delivery_issues',
      'packaging_problems',
      'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'test_result']
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  investigation: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    findings: String,
    conclusion: {
      type: String,
      enum: ['valid', 'invalid', 'partially_valid', 'needs_more_info']
    },
    actionTaken: {
      type: String,
      enum: [
        'product_suspended',
        'farmer_warned',
        'refund_issued',
        'replacement_sent',
        'no_action',
        'farmer_suspended'
      ]
    },
    notes: String,
    completedAt: Date
  },
  resolution: {
    action: {
      type: String,
      enum: ['product_removed', 'farmer_warned', 'refund_processed', 'replacement_sent', 'no_action']
    },
    amount: Number,
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
qualityFlagSchema.index({ product: 1, status: 1 });
qualityFlagSchema.index({ farmer: 1, status: 1 });
qualityFlagSchema.index({ flagType: 1, severity: 1 });
qualityFlagSchema.index({ status: 1, createdAt: -1 });
qualityFlagSchema.index({ 'investigation.assignedTo': 1, status: 1 });

// Virtual for flag age
qualityFlagSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for priority score
qualityFlagSchema.virtual('priorityScore').get(function() {
  let score = 0;
  
  // Severity scoring
  const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
  score += severityScores[this.severity] || 0;
  
  // Age scoring (older flags get higher priority)
  const age = this.ageInDays;
  if (age > 7) score += 2;
  else if (age > 3) score += 1;
  
  // Status scoring
  if (this.status === 'pending') score += 2;
  else if (this.status === 'investigating') score += 1;
  
  return score;
});

// Static method to get flags by severity
qualityFlagSchema.statics.getFlagsBySeverity = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        flags: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Static method to get farmer quality score
qualityFlagSchema.statics.getFarmerQualityScore = async function(farmerId) {
  const pipeline = [
    {
      $match: {
        farmer: mongoose.Types.ObjectId(farmerId),
        status: { $in: ['resolved', 'dismissed'] }
      }
    },
    {
      $group: {
        _id: '$investigation.conclusion',
        count: { $sum: 1 }
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  let totalFlags = 0;
  let validFlags = 0;
  
  results.forEach(result => {
    totalFlags += result.count;
    if (result._id === 'valid' || result._id === 'partially_valid') {
      validFlags += result.count;
    }
  });
  
  return totalFlags > 0 ? ((totalFlags - validFlags) / totalFlags) * 10 : 10;
};

// Static method to get quality trends
qualityFlagSchema.statics.getQualityTrends = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          flagType: '$flagType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('QualityFlag', qualityFlagSchema); 