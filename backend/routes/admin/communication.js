const express = require('express');
const router = express.Router();
const Announcement = require('../../models/Announcement');
const AdminAction = require('../../models/AdminAction');
const roleCheck = require('../../middlewares/roleCheck');

// Placeholder for communication routes
// Will be implemented in Phase 4

router.get('/', (req, res) => {
  res.json({ message: 'Communication routes - to be implemented in Phase 4' });
});

// 1. List all announcements with filtering
router.get('/announcements', roleCheck('super_admin', 'communication_manager'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      targetAudience,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'createdBy approvedBy',
        select: 'name email role'
      }
    };

    const announcements = await Announcement.paginate(query, options);

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});

// 2. Create a new announcement
router.post('/announcements', roleCheck('super_admin', 'communication_manager'), async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      targetRegions,
      targetCategories,
      schedule,
      delivery,
      attachments,
      tags
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      type,
      priority,
      targetAudience,
      targetRegions,
      targetCategories,
      schedule,
      delivery,
      attachments,
      tags,
      createdBy: req.user.id
    });

    await announcement.save();

    // Log admin action
    await AdminAction.logAction({
      admin: req.user.id,
      action: 'announcement_created',
      targetType: 'system',
      details: { title, type, priority },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      location: req.user.location || '',
      status: 'success'
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
});

// 3. Update an announcement
router.put('/announcements/:id', roleCheck('super_admin', 'communication_manager'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== 'approvedBy') {
        announcement[key] = req.body[key];
      }
    });

    announcement.updatedAt = new Date();
    await announcement.save();

    // Log admin action
    await AdminAction.logAction({
      admin: req.user.id,
      action: 'announcement_updated',
      targetType: 'system',
      targetId: announcement._id,
      details: { title: announcement.title, changes: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      location: req.user.location || '',
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
});

// 4. Delete an announcement
router.delete('/announcements/:id', roleCheck('super_admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    // Log admin action
    await AdminAction.logAction({
      admin: req.user.id,
      action: 'announcement_deleted',
      targetType: 'system',
      targetId: announcement._id,
      details: { title: announcement.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      location: req.user.location || '',
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
});

// 5. Approve an announcement
router.post('/announcements/:id/approve', roleCheck('super_admin'), async (req, res) => {
  try {
    const { notes } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.status = 'active';
    announcement.approvedBy = req.user.id;
    announcement.approvedAt = new Date();
    await announcement.save();

    // Log admin action
    await AdminAction.logAction({
      admin: req.user.id,
      action: 'announcement_approved',
      targetType: 'system',
      targetId: announcement._id,
      details: { title: announcement.title, notes },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      location: req.user.location || '',
      status: 'success'
    });

    res.json({
      success: true,
      message: 'Announcement approved successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving announcement',
      error: error.message
    });
  }
});

// 6. Get system notifications for admins
router.get('/notifications', roleCheck('super_admin', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get recent admin actions as notifications
    const notifications = await AdminAction.find({
      action: { 
        $in: [
          'quality_flag', 'product_suspension', 'farmer_suspension', 
          'order_status_update', 'dispute_resolution', 'system_maintenance'
        ]
      }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('admin', 'name');

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

module.exports = router; 