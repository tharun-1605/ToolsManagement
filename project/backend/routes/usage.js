import express from 'express';
import Usage from '../models/Usage.js';
import Tool from '../models/Tool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get usage history
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'operator') {
      query.operator = req.user._id;
    }

    const usage = await Usage.find(query)
      .populate('tool', 'name category')
      .populate('operator', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get usage analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { period = '7d', toolId } = req.query;
    
    let dateFilter = new Date();
    switch (period) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    let matchQuery = { createdAt: { $gte: dateFilter } };
    
    if (req.user.role === 'operator') {
      matchQuery.operator = req.user._id;
    }
    
    if (toolId) {
      matchQuery.tool = toolId;
    }

    const analytics = await Usage.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalDuration: { $sum: "$duration" },
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;