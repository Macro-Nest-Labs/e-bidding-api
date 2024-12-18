import { Request, Response } from 'express';

import { ProductModel } from '../models/product';
import { IProductCreateRequestBody, IProductRequestParams, IProductUpdateRequestBody } from '../types/Product';
import { log } from '../utils/console';
import { generateProduct } from '../utils/models/product.utils';

export const createProduct = async (
  req: Request<Record<string, never>, Record<string, never>, IProductCreateRequestBody>,
  res: Response,
) => {
  log('Creating product');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;

  try {
    const product = await generateProduct(body);

    const response = {
      data: product,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(` Product.create name=[${body.name}]`, error);
    res.status(500).json({ error: '[+] Error creating the product.' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  log('Getting all products');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const products = await ProductModel.find({});
    const response = {
      data: products,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Products.getAll', error);
    res.status(500).json({ error: '[+] Error getting all products.' });
  }
};

export const getProductDetails = async (req: Request<IProductRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting product details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const product = await ProductModel.findById(id);
    const response = {
      data: product,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Product.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting product details.' });
  }
};

export const updateProduct = async (
  req: Request<IProductRequestParams, Record<string, never>, IProductUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating product with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const updatedProduct = await existingProduct.updateOne(body);
    const response = {
      data: updatedProduct,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Product.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the product.' });
  }
};

export const deleteProduct = async (req: Request<IProductRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting product with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await existingProduct.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` Product.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the product.' });
  }
};
