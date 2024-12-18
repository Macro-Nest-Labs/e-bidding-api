import { Router } from 'express';

import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierDetails,
  getSupplierDetailsByEmail,
  updateSupplier,
} from '../controllers/supplier.controller';

const supplierRouter = Router();

// Router level middleware
// supplierRouter.use(authentication)

// Create supplier
supplierRouter.post('/', createSupplier);
// Get all suppliers
supplierRouter.get('/', getAllSuppliers);
// Get supplier by id
supplierRouter.get('/:id', getSupplierDetails);
// Get supplier details by email
supplierRouter.get('/email/:email', getSupplierDetailsByEmail);
// Update supplier by id
supplierRouter.put('/:id', updateSupplier);
// Delete supplier by id
supplierRouter.delete('/:id', deleteSupplier);

export default supplierRouter;
