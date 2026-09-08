import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { verifyToken, AuthRequest, AuthenticatedUser } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();

// Optional auth helper to check if token exists without throwing 401
const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Invalid token ignored for optional auth
    }
  }
  next();
};

// PUBLIC: GET /api/orders/track/:query
// Anyone can track an order by Order Number (NEX-...) or Tracking Number (TRK-...)
router.get('/track/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Tracking query is required.' });
    }

    const order = await db.getOrderByTrackingOrNumber(query.trim());
    if (!order) {
      return res.status(404).json({ error: 'No order found with the provided reference or tracking number.' });
    }

    // Mask sensitive address information slightly for public tracking security
    const sanitizedOrder = {
      ...order,
      shippingAddress: order.shippingAddress.replace(/^(\d+).*$/, '$1 [Protected Street]'),
    };

    res.json({ order: sanitizedOrder });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to retrieve tracking information.' });
  }
});

// AUTHENTICATED: GET /api/orders (Order History for logged-in user)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await db.getOrders(req.user!.id);
    res.json({ orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

// AUTHENTICATED: GET /api/orders/:id
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }

    const order = await db.getOrderById(orderId, req.user!.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json({ order });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to retrieve order details.' });
  }
});

// CREATE ORDER: POST /api/orders (Supports both Authenticated and Guest checkouts)
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      customerEmail,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      shippingMethod,
      paymentIntentId,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return res.status(400).json({ error: 'Complete recipient and shipping address information is required.' });
    }

    // Verify stock availability
    for (const item of items) {
      const product = await db.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} was not found.` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}.`,
        });
      }
    }

    const userId = req.user?.id || null;

    const order = await db.createOrder({
      userId,
      customerEmail: customerEmail || req.user?.email || 'guest@fincommerce.in',
      items,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry: shippingCountry || 'India',
      shippingMethod: shippingMethod || 'Bluedart Express Surface (2-3 Days)',
      paymentMethod: (req.body.paymentMethod as any) || 'upi_instant',
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to process order placement.' });
  }
});

export default router;
