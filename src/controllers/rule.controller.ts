import { Request, Response } from 'express';

import { RuleModel } from '../models/rule';
import { IRuleCreateRequestBody, IRuleRequestParams, IRuleUpdateRequestBody } from '../types/Rule';
import { log } from '../utils/console';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

export const createRule = async (req: Request<Record<string, never>, Record<string, never>, IRuleCreateRequestBody>, res: Response) => {
  log('Creating rule');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const sanitizedName = sanitize(req.body.name);
  const uuid = uuidFromString(RuleModel.name, sanitizedName);
  const body = req.body;

  try {
    const rule = new RuleModel({
      uuid,
      ...body,
    });
    const response = {
      data: rule,
    };

    await rule.save();
    res.status(201).json(response);
  } catch (error) {
    console.error(` Rule.create name=[${sanitizedName}] uuid=[${uuid}]`, error);
    res.status(500).json({ error: '[+] Error creating the rule.' });
  }
};

export const getAllRules = async (req: Request, res: Response) => {
  log('Getting all rules');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const rules = await RuleModel.find({});
    const response = {
      data: rules,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Rules.getAll', error);
    res.status(500).json({ error: '[+] Error getting all rules.' });
  }
};

export const getRuleDetails = async (req: Request<IRuleRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting rule details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const rule = await RuleModel.findById(id);
    const response = {
      data: rule,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` rule.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting rule details.' });
  }
};

export const updateRule = async (req: Request<IRuleRequestParams, Record<string, never>, IRuleUpdateRequestBody>, res: Response) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating rule with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingRule = await RuleModel.findById(id);

    if (!existingRule) {
      return res.status(404).json({ error: 'Rule not found.' });
    }

    const updatedRule = await existingRule.updateOne(body);
    const response = {
      data: updatedRule,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Rule.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the rule.' });
  }
};

export const deleteRule = async (req: Request<IRuleRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting rule with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingRule = await RuleModel.findById(id);

    if (!existingRule) {
      return res.status(404).json({ error: 'Rule not found.' });
    }

    await existingRule.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` Rule.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the rule.' });
  }
};
