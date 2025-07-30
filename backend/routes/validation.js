const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const EmailValidation = require('../models/EmailValidation');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/validation/single
// @desc    Validate single email
// @access  Private
router.post('/single', [
  auth,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const userId = req.user.id;

    // Check if email was recently validated
    const existingValidation = await EmailValidation.findOne({
      user: userId,
      email,
      validatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
    });

    if (existingValidation) {
      return res.json({
        success: true,
        data: existingValidation,
        cached: true
      });
    }

    // Perform validation
    const validationResult = await validateEmail(email);
    
    const validation = new EmailValidation({
      user: userId,
      email,
      status: validationResult.status,
      score: validationResult.score,
      reason: validationResult.reason,
      details: validationResult.details
    });

    await validation.save();

    // Update user usage
    const user = await User.findById(userId);
    user.usage.emailsValidated = (user.usage.emailsValidated || 0) + 1;
    await user.save();

    res.json({
      success: true,
      data: validation,
      cached: false
    });
  } catch (error) {
    console.error('Single email validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/validation/bulk
// @desc    Validate multiple emails
// @access  Private
router.post('/bulk', [
  auth,
  body('emails').isArray({ min: 1, max: 1000 }).withMessage('Emails array is required (max 1000)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emails } = req.body;
    const userId = req.user.id;
    const results = [];

    // Process emails in batches
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        try {
          // Check if already validated recently
          let validation = await EmailValidation.findOne({
            user: userId,
            email: email.toLowerCase(),
            validatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          });

          if (!validation) {
            const validationResult = await validateEmail(email);
            
            validation = new EmailValidation({
              user: userId,
              email: email.toLowerCase(),
              status: validationResult.status,
              score: validationResult.score,
              reason: validationResult.reason,
              details: validationResult.details
            });
            
            await validation.save();
          }

          return validation;
        } catch (error) {
          console.error(`Validation error for ${email}:`, error);
          return {
            email: email.toLowerCase(),
            status: 'unknown',
            score: 0,
            reason: 'Validation failed',
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update user usage
    const user = await User.findById(userId);
    user.usage.emailsValidated = (user.usage.emailsValidated || 0) + results.length;
    await user.save();

    res.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.status === 'valid').length,
        invalid: results.filter(r => r.status === 'invalid').length,
        risky: results.filter(r => r.status === 'risky').length,
        unknown: results.filter(r => r.status === 'unknown').length
      }
    });
  } catch (error) {
    console.error('Bulk email validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/validation/history
// @desc    Get validation history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    
    const validations = await EmailValidation.find(query)
      .sort({ validatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await EmailValidation.countDocuments(query);
    
    res.json({
      success: true,
      data: validations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get validation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/validation/stats
// @desc    Get validation statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
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

    const totalValidations = await EmailValidation.countDocuments({
      user: userId,
      validatedAt: { $gte: startDate }
    });

    const validEmails = await EmailValidation.countDocuments({
      user: userId,
      status: 'valid',
      validatedAt: { $gte: startDate }
    });

    const invalidEmails = await EmailValidation.countDocuments({
      user: userId,
      status: 'invalid',
      validatedAt: { $gte: startDate }
    });

    const riskyEmails = await EmailValidation.countDocuments({
      user: userId,
      status: 'risky',
      validatedAt: { $gte: startDate }
    });

    const unknownEmails = await EmailValidation.countDocuments({
      user: userId,
      status: 'unknown',
      validatedAt: { $gte: startDate }
    });

    res.json({
      success: true,
      data: {
        totalValidations,
        validEmails,
        invalidEmails,
        riskyEmails,
        unknownEmails,
        validRate: totalValidations > 0 ? (validEmails / totalValidations) * 100 : 0,
        invalidRate: totalValidations > 0 ? (invalidEmails / totalValidations) * 100 : 0,
        riskyRate: totalValidations > 0 ? (riskyEmails / totalValidations) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get validation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function for email validation
async function validateEmail(email) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        status: 'invalid',
        score: 0,
        reason: 'Invalid email format',
        details: { syntax: false, domain: false, mx: false, disposable: false, role: false, free: false, deliverable: false }
      };
    }

    const [localPart, domain] = email.split('@');
    
    // Check for disposable domains
    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
    const isDisposable = disposableDomains.includes(domain.toLowerCase());

    // Check for role-based emails
    const roleKeywords = ['admin', 'support', 'info', 'contact', 'sales', 'marketing', 'noreply'];
    const isRole = roleKeywords.some(keyword => localPart.toLowerCase().includes(keyword));

    // Check for free providers
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const isFree = freeProviders.includes(domain.toLowerCase());

    let score = 50;
    if (!isDisposable) score += 20;
    if (!isRole) score += 15;
    if (domain.includes('.')) score += 15;

    let status;
    if (isDisposable) {
      status = 'risky';
      score = Math.min(score, 60);
    } else if (score >= 80) {
      status = 'valid';
    } else if (score >= 50) {
      status = 'risky';
    } else {
      status = 'invalid';
    }

    return {
      status,
      score,
      reason: status === 'valid' ? 'Deliverable' : status === 'risky' ? (isDisposable ? 'Disposable email' : 'Risky domain') : 'Invalid or non-existent',
      details: {
        syntax: true,
        domain: true,
        mx: !isDisposable,
        disposable: isDisposable,
        role: isRole,
        free: isFree,
        deliverable: status === 'valid'
      }
    };
  } catch (error) {
    return {
      status: 'unknown',
      score: 0,
      reason: 'Validation failed',
      details: { syntax: false, domain: false, mx: false, disposable: false, role: false, free: false, deliverable: false }
    };
  }
}

module.exports = router;