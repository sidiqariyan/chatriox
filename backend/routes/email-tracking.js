const express = require('express');
const { auth } = require('../middleware/auth');
const EmailActivity = require('../models/EmailActivity');
const Campaign = require('../models/Campaign');

const router = express.Router();

// @route   GET /api/email-tracking/activities
// @desc    Get user's email activities
// @access  Private
router.get('/activities', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      campaign, 
      recipient,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { user: req.user.id };
    
    // Apply filters
    if (status) query.status = status;
    if (campaign) query.campaign = campaign;
    if (recipient) query['recipient.email'] = { $regex: recipient, $options: 'i' };
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const activities = await EmailActivity.find(query)
      .populate('campaign', 'name status')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await EmailActivity.countDocuments(query);
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get email activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/email-tracking/analytics
// @desc    Get email analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get email statistics
    const totalEmails = await EmailActivity.countDocuments({
      user: req.user.id,
      createdAt: { $gte: startDate }
    });

    const deliveredEmails = await EmailActivity.countDocuments({
      user: req.user.id,
      status: { $in: ['delivered', 'opened', 'clicked'] },
      createdAt: { $gte: startDate }
    });

    const openedEmails = await EmailActivity.countDocuments({
      user: req.user.id,
      status: { $in: ['opened', 'clicked'] },
      createdAt: { $gte: startDate }
    });

    const clickedEmails = await EmailActivity.countDocuments({
      user: req.user.id,
      status: 'clicked',
      createdAt: { $gte: startDate }
    });

    const bouncedEmails = await EmailActivity.countDocuments({
      user: req.user.id,
      status: 'bounced',
      createdAt: { $gte: startDate }
    });

    // Calculate rates
    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0;
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0;
    const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails) * 100 : 0;

    // Get daily email counts for chart
    const dailyStats = await EmailActivity.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          sent: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0]
            }
          },
          opened: {
            $sum: {
              $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0]
            }
          },
          clicked: {
            $sum: {
              $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get top performing templates
    const topTemplates = await EmailActivity.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$template.name',
          sent: { $sum: 1 },
          opened: {
            $sum: {
              $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0]
            }
          },
          clicked: {
            $sum: {
              $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          openRate: {
            $cond: [
              { $gt: ['$sent', 0] },
              { $multiply: [{ $divide: ['$opened', '$sent'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $sort: { openRate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEmails,
          deliveredEmails,
          openedEmails,
          clickedEmails,
          bouncedEmails,
          deliveryRate: parseFloat(deliveryRate.toFixed(2)),
          openRate: parseFloat(openRate.toFixed(2)),
          clickRate: parseFloat(clickRate.toFixed(2)),
          bounceRate: parseFloat(bounceRate.toFixed(2))
        },
        dailyStats,
        topTemplates
      }
    });
  } catch (error) {
    console.error('Get email analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/email-tracking/export
// @desc    Export email activities
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    
    const query = { user: req.user.id };
    
    // Apply same filters as activities endpoint
    if (filters.status) query.status = filters.status;
    if (filters.campaign) query.campaign = filters.campaign;
    if (filters.recipient) query['recipient.email'] = { $regex: filters.recipient, $options: 'i' };
    
    const activities = await EmailActivity.find(query)
      .populate('campaign', 'name')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      const csv = require('csv-writer').createObjectCsvStringifier({
        header: [
          { id: 'recipientEmail', title: 'Recipient Email' },
          { id: 'recipientName', title: 'Recipient Name' },
          { id: 'subject', title: 'Subject' },
          { id: 'templateName', title: 'Template' },
          { id: 'status', title: 'Status' },
          { id: 'sentAt', title: 'Sent At' },
          { id: 'openedAt', title: 'Opened At' },
          { id: 'clickedAt', title: 'Clicked At' },
          { id: 'campaignName', title: 'Campaign' }
        ]
      });

      const records = activities.map(activity => ({
        recipientEmail: activity.recipient.email,
        recipientName: activity.recipient.name || '',
        subject: activity.emailDetails.subject,
        templateName: activity.template.name || '',
        status: activity.status,
        sentAt: activity.tracking.sentAt?.toISOString() || '',
        openedAt: activity.tracking.openedAt?.toISOString() || '',
        clickedAt: activity.tracking.clickedAt?.toISOString() || '',
        campaignName: activity.campaign?.name || ''
      }));

      const csvString = csv.getHeaderString() + csv.stringifyRecords(records);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="email_activities_${Date.now()}.csv"`);
      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: activities
      });
    }
  } catch (error) {
    console.error('Export email activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/email-tracking/track-open/:activityId
// @desc    Track email open
// @access  Public
router.get('/track-open/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const activity = await EmailActivity.findById(activityId);
    if (activity) {
      activity.status = 'opened';
      activity.tracking.openedAt = new Date();
      activity.tracking.opens += 1;
      activity.tracking.userAgent = req.get('User-Agent');
      activity.tracking.ipAddress = req.ip;
      await activity.save();
    }
    
    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  } catch (error) {
    console.error('Track open error:', error);
    res.status(200).send('');
  }
});

// @route   GET /api/email-tracking/track-click/:activityId
// @desc    Track email click
// @access  Public
router.get('/track-click/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const { url } = req.query;
    
    const activity = await EmailActivity.findById(activityId);
    if (activity) {
      activity.status = 'clicked';
      activity.tracking.clickedAt = new Date();
      activity.tracking.clicks += 1;
      activity.tracking.userAgent = req.get('User-Agent');
      activity.tracking.ipAddress = req.ip;
      await activity.save();
    }
    
    // Redirect to original URL
    res.redirect(url || 'https://example.com');
  } catch (error) {
    console.error('Track click error:', error);
    res.redirect('https://example.com');
  }
});

module.exports = router;