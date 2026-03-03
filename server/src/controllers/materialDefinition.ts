import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';
import { MaterialDefinitionSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

// Get all material definitions for the user, optionally filtered by construction
export const getMaterialDefinitions = async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { construction } = req.query;

    let query = supabase.from('MaterialDefinitions').select('*').eq('user_id', userId);

    if (typeof construction === 'string') {
      query = query.eq('construction', construction);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch material definitions', { detail: error.message });
    }

    res.json(data.map((item) => sanitizeAndCamelcase(item)));
  } catch (error) {
    handleControllerError(res, error, 'Get material definitions error');
  }
};

// Create a new material definition
export const createMaterialDefinition = async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { name, unit, default_unit_price, note, construction } = pickSnakeBody<
      Omit<MaterialDefinitionSnakeBody, 'id' | 'user_id'>
    >(req, ['name', 'unit', 'default_unit_price', 'note', 'construction']);

    if (!name || !construction) {
      throw new AppError('Name and construction are required for material definition', {
        statusCode: 400,
      });
    }

    const { data, error } = await supabase
      .from('MaterialDefinitions')
      .insert([
        {
          user_id: userId,
          name,
          unit,
          default_unit_price,
          note,
          construction,
        },
      ])
      .select();

    if (error) {
      throw new AppError('Failed to create material definition', { detail: error.message });
    }

    res.status(201).json(sanitizeAndCamelcase(data[0]));
  } catch (error) {
    handleControllerError(res, error, 'Create material definition error');
  }
};

// Update a material definition
export const updateMaterialDefinition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, default_unit_price, note, construction } = pickSnakeBody<
      Partial<MaterialDefinitionSnakeBody>
    >(req, ['name', 'unit', 'default_unit_price', 'note', 'construction']);

    const { data, error } = await supabase
      .from('MaterialDefinitions')
      .update({ name, unit, default_unit_price, note, construction })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update material definition', { detail: error.message });
    }

    res.json(sanitizeAndCamelcase(data));
  } catch (error) {
    handleControllerError(res, error, 'Update material definition error');
  }
};

// Delete a material definition
export const deleteMaterialDefinition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('MaterialDefinitions').delete().eq('id', id);

    if (error) {
      throw new AppError('Failed to delete material definition', { detail: error.message });
    }

    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error, 'Delete material definition error');
  }
};

// Batch update material definitions
export const batchUpdateMaterialDefinitions = async (req: Request, res: Response) => {
  try {
    const { material_definitions: materialDefinitions } = snakecaseKeys(req.body, {
      deep: true,
    }) as {
      material_definitions: (Partial<MaterialDefinitionSnakeBody> & { id: string })[];
    };

    if (!Array.isArray(materialDefinitions) || materialDefinitions.length === 0) {
      throw new AppError('Material definitions array is required', {
        statusCode: 400,
        code: 'MATERIAL_DEFINITIONS_ARRAY_REQUIRED',
      });
    }

    const updates = materialDefinitions.map((md) => {
      const payload: Partial<MaterialDefinitionSnakeBody> = {
        name: md.name,
        unit: md.unit,
        default_unit_price: md.default_unit_price,
        note: md.note,
        construction: md.construction,
      };

      Object.keys(payload).forEach((key) => {
        if ((payload as Record<string, unknown>)[key] === undefined) {
          delete (payload as Record<string, unknown>)[key];
        }
      });

      return supabase.from('MaterialDefinitions').update(payload).eq('id', md.id).select();
    });

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      throw new AppError('Failed to update some material definitions', {
        statusCode: 500,
        code: 'MATERIAL_DEFINITION_BATCH_UPDATE_FAILED',
        detail: errors.map((e) => e.error?.message).join(', '),
      });
    }

    const updatedData = results.flatMap((r) => r.data || []);

    return res.status(200).json({ success: true, data: mapSanitizeCamelcase(updatedData) });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Batch update material definitions error');
  }
};
