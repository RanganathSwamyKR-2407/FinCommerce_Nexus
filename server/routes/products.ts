import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      featured,
      page,
      limit,
    } = req.query;

    const result = await db.getProducts({
      q: typeof q === 'string' ? q : undefined,
      category: typeof category === 'string' ? category : undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      rating: rating ? parseFloat(rating as string) : undefined,
      inStock: inStock === 'true' || inStock === '1',
      sort: typeof sort === 'string' ? sort : undefined,
      featured: featured === 'true' || featured === '1',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await db.getCategories();
    // Compute item counts for each category
    const allProducts = await db.getProducts({ limit: 1000 });
    const enriched = categories.map(cat => ({
      ...cat,
      productCount: allProducts.products.filter(p => p.categoryName === cat.name).length,
    }));
    res.json({ categories: enriched });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Also fetch related products in the same category
    const related = await db.getProducts({ category: product.categoryName, limit: 4 });
    const relatedProducts = related.products.filter(p => p.id !== product.id).slice(0, 3);

    res.json({ product, relatedProducts });
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

export default router;
