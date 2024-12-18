import { Request, Response } from 'express';

import { SupplierModel } from '../models/supplier';
import { ISupplierCreateRequestBody, ISupplierRequestParams, ISupplierUpdateRequestBody } from '../types/Supplier';
import { log } from '../utils/console';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

export const createSupplier = async (
  req: Request<Record<string, never>, Record<string, never>, ISupplierCreateRequestBody>,
  res: Response,
) => {
  log('Creating supplier');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const sanitizedName = sanitize(req.body.firstName + req.body.lastName);
  const uuid = uuidFromString(SupplierModel.name, sanitizedName);
  const body = req.body;

  try {
    const supplier = new SupplierModel({
      uuid,
      ...body,
    });
    // TODO: Return 409 if supplier already exists, FE logic needs to be updated as well after this

    await supplier.validate();
    await supplier.save();

    const response = {
      data: supplier,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(` Supplier.create name=[${sanitizedName}] uuid=[${uuid}]`, error);
    res.status(500).json({ error: '[+] Error creating the supplier.' });
  }
};

export const getAllSuppliers = async (req: Request, res: Response) => {
  log('Getting all suppliers');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const suppliers = await SupplierModel.find({});
    const response = {
      data: suppliers,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Supplier.getAll', error);
    res.status(500).json({ error: '[+] Error getting all suppliers.' });
  }
};

export const getSupplierDetails = async (req: Request<ISupplierRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting supplier details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const supplier = await SupplierModel.findById(id);
    const response = {
      data: supplier,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Supplier.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting supplier details.' });
  }
};

// Fetch supplier details by Email
export const getSupplierDetailsByEmail = async (req: Request<{ email: string }>, res: Response) => {
  const email = req.params.email;

  log(`Getting supplier details for email=[${email}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const supplier = await SupplierModel.findOne({ email: email });

    if (!supplier) {
      return res.status(404).json({ error: '[+] Supplier not found.' });
    }

    const response = {
      data: supplier,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Supplier.getByEmail email=[${email}]`, error);
    res.status(500).json({ error: '[+] Error getting Supplier details by email.' });
  }
};

export const updateSupplier = async (
  req: Request<ISupplierRequestParams, Record<string, never>, ISupplierUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating supplier with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedSupplier = await SupplierModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true, // This will ensure that the update is validated against the schema
    });

    if (!updatedSupplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    const response = {
      data: updatedSupplier,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Supplier.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the supplier.' });
  }
};

export const deleteSupplier = async (req: Request<ISupplierRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting supplier with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const deletionResult = await SupplierModel.deleteOne({ _id: id });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    // Respond with a 204 status (No Content) for a successful deletion
    res.status(204).end();
  } catch (error) {
    log(`Error deleting supplier: ${error.message}`);
    res.status(500).json({ error: 'Error deleting the supplier.' });
  }
};
