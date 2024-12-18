import { Router } from 'express';

import { createProduct, deleteProduct, getAllProducts, getProductDetails, updateProduct } from '../controllers/product.controller';

const productRouter = Router();

// Create product
productRouter.post('/', createProduct);
// Get all products
productRouter.get('/', getAllProducts);
// Get product by id
productRouter.get('/:id', getProductDetails);
// Update product by id
productRouter.put('/:id', updateProduct);
// Delete product by id
productRouter.delete('/:id', deleteProduct);

export default productRouter;
