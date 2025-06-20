import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Tool from '../models/Tool.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get orders (filtered by role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'supervisor') {
      query.supervisor = req.user._id;
    } else if (req.user.role === 'shopkeeper') {
      query.shopkeeper = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('supervisor', 'name email companyName')
      .populate('shopkeeper', 'name email shopName')
      .populate('tool', 'name category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order (supervisor only)
router.post('/', authenticate, authorize('supervisor'), [
  body('toolId').isMongoId(),
  body('quantity').isInt({ min: 1 }),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toolId, quantity, notes } = req.body;

    const tool = await Tool.findById(toolId).populate('shopkeeper');
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const order = new Order({
      supervisor: req.user._id,
      shopkeeper: tool.shopkeeper._id,
      tool: toolId,
      quantity,
      notes: notes || ''
    });

    await order.save();
    await order.populate(['supervisor', 'shopkeeper', 'tool']);

    // Notify shopkeeper
    const io = req.app.get('io');
    io.to('shopkeeper').emit('new-order', {
      orderId: order._id,
      tool: tool.name,
      quantity,
      supervisor: req.user.name,
      company: req.user.companyName
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (shopkeeper only)
router.put('/:id/status', authenticate, authorize('shopkeeper'), [
  body('status').isIn(['approved', 'rejected', 'fulfilled']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    const order = await Order.findOne({ _id: req.params.id, shopkeeper: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (notes) order.notes = notes;
    
    if (status === 'approved') {
      order.approvedAt = new Date();
      
      // Add company to tool's orderedByCompanies array
      const tool = await Tool.findById(order.tool);
      const supervisor = await User.findById(order.supervisor);
      
      if (tool && supervisor) {
        const existingOrder = tool.orderedByCompanies.find(
          orderInfo => orderInfo.supervisorId.toString() === supervisor._id.toString()
        );
        
        if (!existingOrder) {
          tool.orderedByCompanies.push({
            companyName: supervisor.companyName,
            supervisorId: supervisor._id,
            orderedAt: new Date()
          });
          await tool.save();
        }
      }
    } else if (status === 'fulfilled') {
      order.fulfilledAt = new Date();
      
      // Update tool stock
      const tool = await Tool.findById(order.tool);
      if (tool) {
        tool.stock += order.quantity;
        await tool.save();
      }
    }

    await order.save();
    await order.populate(['supervisor', 'shopkeeper', 'tool']);

    // Notify supervisor
    const io = req.app.get('io');
    io.to('supervisor').emit('order-status-update', {
      orderId: order._id,
      status,
      tool: order.tool.name
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;