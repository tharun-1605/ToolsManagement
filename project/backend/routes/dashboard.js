import express from 'express';
import Tool from '../models/Tool.js';
import Order from '../models/Order.js';
import Usage from '../models/Usage.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'shopkeeper') {
      const totalTools = await Tool.countDocuments({ shopkeeper: req.user._id });
      const lowLifeTools = await Tool.countDocuments({ 
        shopkeeper: req.user._id,
        $expr: { $lte: ['$remainingLife', '$thresholdLimit'] }
      });
      const pendingOrders = await Order.countDocuments({ 
        shopkeeper: req.user._id, 
        status: 'pending' 
      });
      const totalStock = await Tool.aggregate([
        { $match: { shopkeeper: req.user._id } },
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ]);

      stats = {
        totalTools,
        lowLifeTools,
        pendingOrders,
        totalStock: totalStock[0]?.total || 0
      };
    } 
    else if (req.user.role === 'supervisor') {
      const totalOrders = await Order.countDocuments({ supervisor: req.user._id });
      const pendingOrders = await Order.countDocuments({ 
        supervisor: req.user._id, 
        status: 'pending' 
      });
      const approvedOrders = await Order.countDocuments({ 
        supervisor: req.user._id, 
        status: 'approved' 
      });
      const lowLifeTools = await Tool.countDocuments({ 
        $expr: { $lte: ['$remainingLife', '$thresholdLimit'] }
      });

      stats = {
        totalOrders,
        pendingOrders,
        approvedOrders,
        lowLifeTools
      };
    }
    else if (req.user.role === 'operator') {
      const totalUsage = await Usage.countDocuments({ operator: req.user._id });
      const todayUsage = await Usage.countDocuments({ 
        operator: req.user._id,
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      });
      const activeTools = await Tool.countDocuments({ 
        currentUser: req.user._id,
        status: 'in-use'
      });
      const totalHours = await Usage.aggregate([
        { $match: { operator: req.user._id } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);

      stats = {
        totalUsage,
        todayUsage,
        activeTools,
        totalHours: Math.round(totalHours[0]?.total || 0)
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;