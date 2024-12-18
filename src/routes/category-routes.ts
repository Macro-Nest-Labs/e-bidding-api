import { Router } from 'express';

import { createCategory, deleteCategory, getAllCategories, getCategoryDetails, updateCategory } from '../controllers/category.controller';

const categoryRouter = Router();

// Create Rule
categoryRouter.post('/', createCategory);
// Get all categories
categoryRouter.get('/', getAllCategories);
// Get category by id
categoryRouter.get('/:id', getCategoryDetails);
// Update category by id
categoryRouter.put('/:id', updateCategory);
// Delete category by id
categoryRouter.delete('/:id', deleteCategory);

export default categoryRouter;
