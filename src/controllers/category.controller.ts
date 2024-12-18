import { Request, Response } from 'express';

import { CategoryModel } from '../models/categoy';
import { ICategoryCreateRequestBody, ICategoryRequestParams, ICategoryUpdateRequestBody } from '../types/Category';
import { log } from '../utils/console';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

export const createCategory = async (
  req: Request<Record<string, never>, Record<string, never>, ICategoryCreateRequestBody>,
  res: Response,
) => {
  log('Creating category');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const sanitizedName = sanitize(req.body.name);
  const uuid = uuidFromString(CategoryModel.name, sanitizedName);
  const body = req.body;

  try {
    const existingCategory = await CategoryModel.find({ uuid });

    if (existingCategory.length > 0) {
      return res.status(409).json({ error: '[+] Category already exists!' });
    }

    const category = new CategoryModel({
      uuid,
      ...body,
    });
    const response = {
      data: category,
    };

    await category.save();
    res.status(201).json(response);
  } catch (error) {
    console.error(` Category.create name=[${sanitizedName}] uuid=[${uuid}]`, error);
    res.status(500).json({ error: '[+] Error creating the category.' });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  log('Getting all categories');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const categories = await CategoryModel.find({});

    const response = {
      data: categories,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Categories.getAll', error);
    res.status(500).json({ error: '[+] Error getting all categories.' });
  }
};

export const getCategoryDetails = async (req: Request<ICategoryRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting category details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const category = await CategoryModel.findById(id);
    const response = {
      data: category,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Category.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting category details.' });
  }
};

export const updateCategory = async (
  req: Request<ICategoryRequestParams, Record<string, never>, ICategoryUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating category with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingCategory = await CategoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ error: '[+] Category not found.' });
    }

    const updatedCategory = await existingCategory.updateOne(body);
    const response = {
      data: updatedCategory,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Category.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the category.' });
  }
};

export const deleteCategory = async (req: Request<ICategoryRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting category with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingCategory = await CategoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ error: '[+] Category not found.' });
    }

    await existingCategory.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(`Category.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the category.' });
  }
};
