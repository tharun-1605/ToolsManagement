import express from 'express';
import { body, validationResult } from 'express-validator';
import Tool from '../models/Tool.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all tools (filtered by role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'shopkeeper') {
      query.shopkeeper = req.user._id;
    } else if (req.user.role === 'operator') {
      // Operators only see tools ordered by their company's supervisor
      const supervisor = await User.findOne({ 
        email: req.user.supervisorEmail, 
        role: 'supervisor',
        companyName: req.user.companyName 
      });
      
      if (supervisor) {
        query['orderedByCompanies.supervisorId'] = supervisor._id;
      } else {
        // If no supervisor found, return empty array
        return res.json([]);
      }
    }

    const tools = await Tool.find(query)
      .populate('shopkeeper', 'name shopName')
      .populate('currentUser', 'name')
      .sort({ createdAt: -1 });

    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create tool (shopkeeper only)
router.post('/', authenticate, authorize('shopkeeper'), [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 5 }),
  body('category').trim().isLength({ min: 2 }),
  body('lifeLimit').isInt({ min: 1 }),
  body('thresholdLimit').isInt({ min: 1 }),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, lifeLimit, thresholdLimit, stock } = req.body;

    const tool = new Tool({
      name,
      description,
      category,
      lifeLimit,
      remainingLife: lifeLimit,
      thresholdLimit,
      shopName: req.user.shopName,
      shopkeeper: req.user._id,
      stock: stock || 1
    });

    await tool.save();
    await tool.populate('shopkeeper', 'name shopName');

    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update tool
router.put('/:id', authenticate, authorize('shopkeeper'), async (req, res) => {
  try {
    const tool = await Tool.findOne({ _id: req.params.id, shopkeeper: req.user._id });
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const allowedUpdates = ['name', 'description', 'category', 'thresholdLimit', 'stock'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(tool, updates);
    await tool.save();
    await tool.populate('shopkeeper', 'name shopName');

    res.json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start using tool (operator only)
router.post('/:id/start-usage', authenticate, authorize('operator'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Check if operator's company has ordered this tool
    const supervisor = await User.findOne({ 
      email: req.user.supervisorEmail, 
      role: 'supervisor',
      companyName: req.user.companyName 
    });

    const hasAccess = tool.orderedByCompanies.some(order => 
      order.supervisorId.toString() === supervisor._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Your company has not ordered this tool' });
    }

    if (tool.status !== 'available') {
      return res.status(400).json({ message: 'Tool is not available' });
    }

    if (tool.remainingLife <= 0) {
      return res.status(400).json({ message: 'Tool has no remaining life' });
    }

    tool.status = 'in-use';
    tool.currentUser = req.user._id;
    tool.usageStartTime = new Date();

    await tool.save();

    res.json({ message: 'Tool usage started', tool });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop using tool (operator only)
router.post('/:id/stop-usage', authenticate, authorize('operator'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.status !== 'in-use' || !tool.currentUser?.equals(req.user._id)) {
      return res.status(400).json({ message: 'You are not currently using this tool' });
    }

    const endTime = new Date();
    const startTime = tool.usageStartTime;
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    tool.status = 'available';
    tool.currentUser = null;
    tool.usageStartTime = null;
    tool.remainingLife = Math.max(0, tool.remainingLife - durationHours);
    tool.totalUsageHours += durationHours;

    await tool.save();

    // Create usage record
    const Usage = (await import('../models/Usage.js')).default;
    const usage = new Usage({
      tool: tool._id,
      operator: req.user._id,
      startTime,
      endTime,
      duration: durationHours,
      isActive: false
    });
    await usage.save();

    // Check threshold and notify supervisor
    if (tool.remainingLife <= tool.thresholdLimit) {
      const io = req.app.get('io');
      io.to('supervisor').emit('tool-threshold-alert', {
        tool: tool.name,
        remainingLife: tool.remainingLife,
        thresholdLimit: tool.thresholdLimit,
        shopName: tool.shopName
      });
    }

    res.json({ message: 'Tool usage stopped', tool, durationHours });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete tool
router.delete('/:id', authenticate, authorize('shopkeeper'), async (req, res) => {
  try {
    const tool = await Tool.findOneAndDelete({ _id: req.params.id, shopkeeper: req.user._id });
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;