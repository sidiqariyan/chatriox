const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const ScrapingJob = require('../models/ScrapingJob');
const User = require('../models/User');
const cheerio = require('cheerio');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/scraper/start
// @desc    Start scraping job
// @access  Private
router.post('/start', [
  auth,
  body('type').isIn(['website', 'business_search']).withMessage('Invalid scraping type'),
  body('url').optional().isURL().withMessage('Valid URL is required for website scraping'),
  body('searchQuery').optional().trim().isLength({ min: 1 }).withMessage('Search query is required for business search')
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

    const { type, url, searchQuery, location, settings } = req.body;
    const userId = req.user.id;

    // Validate required fields based on type
    if (type === 'website' && !url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for website scraping'
      });
    }

    if (type === 'business_search' && !searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required for business search'
      });
    }

    const scrapingJob = new ScrapingJob({
      user: userId,
      type,
      url: type === 'website' ? url : undefined,
      searchQuery: type === 'business_search' ? searchQuery : undefined,
      location: location || {},
      settings: {
        depth: settings?.depth || 1,
        maxPages: settings?.maxPages || 50,
        delay: settings?.delay || 2,
        pattern: settings?.pattern || 'all',
        maxResults: settings?.maxResults || 100
      },
      status: 'pending'
    });

    await scrapingJob.save();

    // Start scraping process (in a real implementation, this would be queued)
    processScrapingJob(scrapingJob._id);

    res.status(201).json({
      success: true,
      message: 'Scraping job started',
      data: {
        jobId: scrapingJob._id,
        type: scrapingJob.type,
        status: scrapingJob.status
      }
    });
  } catch (error) {
    console.error('Start scraping error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scraper/jobs
// @desc    Get scraping jobs
// @access  Private
router.get('/jobs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    
    const jobs = await ScrapingJob.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ScrapingJob.countDocuments(query);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get scraping jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scraper/jobs/:id
// @desc    Get job details
// @access  Private
router.get('/jobs/:id', auth, async (req, res) => {
  try {
    const job = await ScrapingJob.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Scraping job not found'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/scraper/jobs/:id/cancel
// @desc    Cancel scraping job
// @access  Private
router.post('/jobs/:id/cancel', auth, async (req, res) => {
  try {
    const job = await ScrapingJob.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Scraping job not found'
      });
    }
    
    if (job.status !== 'running' && job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Job cannot be cancelled in current status'
      });
    }
    
    job.status = 'cancelled';
    await job.save();
    
    res.json({
      success: true,
      message: 'Scraping job cancelled'
    });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scraper/jobs/:id/results
// @desc    Get scraping results
// @access  Private
router.get('/jobs/:id/results', auth, async (req, res) => {
  try {
    const job = await ScrapingJob.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Scraping job not found'
      });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Job is not completed yet'
      });
    }
    
    // Generate CSV content
    const csvHeader = job.type === 'business_search' 
      ? 'Business Name,Email,Phone,Website,Address,Source,Status\n'
      : 'Email,Source,Domain,Status\n';
    
    const csvRows = job.results.map(result => {
      if (job.type === 'business_search') {
        return `"${result.businessName || ''}","${result.email}","${result.phone || ''}","${result.website || ''}","${result.address || ''}","${result.source}","${result.status}"`;
      } else {
        return `"${result.email}","${result.source}","${result.domain || ''}","${result.status}"`;
      }
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="scraping_results_${job._id}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/scraper/stats
// @desc    Get scraping statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalJobs = await ScrapingJob.countDocuments({ user: userId });
    const completedJobs = await ScrapingJob.countDocuments({ user: userId, status: 'completed' });
    const runningJobs = await ScrapingJob.countDocuments({ user: userId, status: 'running' });
    
    // Get total emails found
    const jobs = await ScrapingJob.find({ user: userId, status: 'completed' });
    const totalEmailsFound = jobs.reduce((sum, job) => sum + (job.progress.emailsFound || 0), 0);
    const totalValidEmails = jobs.reduce((sum, job) => sum + (job.progress.validEmails || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalJobs,
        completedJobs,
        runningJobs,
        totalEmailsFound,
        totalValidEmails,
        successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        validationRate: totalEmailsFound > 0 ? (totalValidEmails / totalEmailsFound) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get scraping stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to process scraping job
async function processScrapingJob(jobId) {
  try {
    const job = await ScrapingJob.findById(jobId);
    if (!job) return;

    job.status = 'running';
    job.startedAt = new Date();
    await job.save();

    // Simulate scraping process
    const results = [];
    const totalSteps = 10;

    for (let i = 0; i < totalSteps; i++) {
      // Simulate finding emails
      const emailsInStep = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < emailsInStep; j++) {
        const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const email = `contact${Math.floor(Math.random() * 1000)}@${domain}`;
        
        results.push({
          email,
          source: job.type === 'website' ? job.url : 'Business Directory',
          domain,
          status: Math.random() > 0.3 ? 'valid' : Math.random() > 0.5 ? 'invalid' : 'risky',
          businessName: job.type === 'business_search' ? `Business ${Math.floor(Math.random() * 100)}` : undefined,
          phone: job.type === 'business_search' ? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
          foundAt: new Date()
        });
      }

      // Update progress
      job.progress.pagesScraped = i + 1;
      job.progress.emailsFound = results.length;
      job.progress.validEmails = results.filter(r => r.status === 'valid').length;
      job.progress.percentage = ((i + 1) / totalSteps) * 100;
      job.results = results;
      
      await job.save();

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, job.settings.delay * 1000));
    }

    // Complete the job
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    // Update user usage
    const user = await User.findById(job.user);
    user.usage.websitesScraped = (user.usage.websitesScraped || 0) + 1;
    await user.save();

  } catch (error) {
    console.error('Process scraping job error:', error);
    
    // Mark job as failed
    await ScrapingJob.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: error.message,
      completedAt: new Date()
    });
  }
}

module.exports = router;