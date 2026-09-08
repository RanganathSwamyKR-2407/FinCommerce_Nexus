import { Router } from 'express';
import { db } from '../db/database.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All cart operations require authentication (guest cart is persisted locally in browser and synced upon login)
router.use(verifyToken);

// GET /api/cart
router.get('/', async (req: AuthRequest, res) => {
  try {
    const items = await db.getCart(req.user!.id);
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15.00;
    const total = subtotal + tax + shipping;

    res.json({
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        freeShippingThreshold: 100,
        amountToFreeShipping: Math.max(0, parseFloat((100 - subtotal).toFixed(2))),
      },
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to retrieve shopping cart.' });
  }
});

// POST /api/cart/add
router.post('/add', async (req: AuthRequest, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = await db.getProductById(parseInt(productId, 10));
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const items = await db.addToCart(req.user!.id, product.id, parseInt(quantity, 10) || 1);
    res.json({ message: 'Item added to cart.', items });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// PUT /api/cart/item/:productId
router.put('/item/:productId', async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { quantity } = req.body;

    if (isNaN(productId) || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Invalid product ID or quantity.' });
    }

    const items = await db.updateCartItem(req.user!.id, productId, quantity);
    res.json({ message: 'Cart updated.', items });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update item quantity.' });
  }
});

// DELETE /api/cart/item/:productId
router.delete('/item/:productId', async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const items = await db.removeFromCart(req.user!.id, productId);
    res.json({ message: 'Item removed from cart.', items });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove item from cart.' });
  }
});

// POST /api/cart/sync
router.post('/sync', async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      const updated = await db.syncCart(req.user!.id, items);
      return res.json({ message: 'Cart synced successfully.', items: updated });
    }
    res.status(400).json({ error: 'Items array required.' });
  } catch (error: any) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ error: 'Failed to synchronize cart.' });
  }
});

// DELETE /api/cart
router.delete('/', async (req: AuthRequest, res) => {
  try {
    await db.clearCart(req.user!.id);
    res.json({ message: 'Cart cleared successfully.' });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart.' });
  }
});

export default router;
