import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { MATERIAL_MUTABLE_COLUMNS } from '@/constants/mutableColumns';
import { supabase } from '@/lib/supabase';
import { MaterialSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

type MaterialRecord = MaterialSnakeBody & { id?: string; user_id?: string };

// Get all materials for the current user across all their projects
export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    // Fetch all projects owned by user
    const { data: projects, error: projectsError } = await supabase
      .from('Projects')
      .select('id')
      .eq('user_id', userId);

    if (projectsError) {
      throw new AppError('Failed to fetch user projects', {
        statusCode: 500,
        code: 'USER_PROJECTS_FETCH_FAILED',
        detail: projectsError.message,
      });
    }

    if (!projects || projects.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const projectIds = projects.map((p) => p.id);

    // Fetch planning materials for these projects to resolve unitPrice fallback
    const { data: planningMaterials, error: planningError } = await supabase
      .from('PlanningMaterial')
      .select('id, unit_price, project_id')
      .in('project_id', projectIds);

    if (planningError) {
      throw new AppError('Failed to fetch planning materials for user projects', {
        statusCode: 500,
        code: 'PLANNING_MATERIALS_FETCH_FAILED',
        detail: planningError.message,
      });
    }

    if (!planningMaterials || planningMaterials.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const planningMaterialIds = planningMaterials.map((pm) => pm.id);
    const planningMaterialUnitPriceMap = new Map<string, number | null>(
      planningMaterials.map((pm) => [pm.id, pm.unit_price ?? null])
    );
    const planningMaterialProjectMap = new Map<string, string | null>(
      planningMaterials.map((pm) => [pm.id, pm.project_id ?? null])
    );

    // Fetch all materials linked to those planning materials
    const { data, error } = await supabase
      .from('Materials')
      .select(
        `*,
        materialDefinition:MaterialDefinitions (name, unit)
      `
      )
      .in('planning_material_id', planningMaterialIds)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch materials', {
        statusCode: 500,
        code: 'MATERIALS_FETCH_FAILED',
        detail: error.message,
      });
    }

    const sanitizedData = mapSanitizeCamelcase<MaterialRecord>(data || []) as Array<
      MaterialRecord & { unitPrice?: number | null; planningMaterialId?: string }
    >;
    const dataWithUnitPrice = sanitizedData.map((item) => {
      const unitPriceFromPlanning = item.planningMaterialId
        ? (planningMaterialUnitPriceMap.get(item.planningMaterialId) ?? null)
        : null;

      return {
        ...item,
        unitPrice: item.unitPrice ?? unitPriceFromPlanning ?? null,
        projectId: item.planningMaterialId
          ? (planningMaterialProjectMap.get(item.planningMaterialId) ?? null)
          : null,
      };
    });

    return res.status(200).json({ success: true, data: dataWithUnitPrice });
  } catch (error) {
    return handleControllerError(res, error, 'Get all materials error');
  }
};

// Get a single material by ID
export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;

    if (!materialId) {
      throw new AppError('Material ID is required', {
        statusCode: 400,
        code: 'MATERIAL_ID_REQUIRED',
      });
    }

    const { data, error } = await supabase
      .from('Materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (error || !data) {
      throw new AppError('Material not found', {
        statusCode: 404,
        code: 'MATERIAL_NOT_FOUND',
        detail: error?.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeAndCamelcase<MaterialRecord>(data),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get material by id error');
  }
};

// Get all materials for a specific project
export const getMaterialsByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const { data: planningMaterials, error: planningError } = await supabase
      .from('PlanningMaterial')
      .select('id, unit_price')
      .eq('project_id', projectId);

    if (planningError) {
      throw new AppError('Failed to fetch planning materials for project', {
        statusCode: 500,
        code: 'PLANNING_MATERIALS_FETCH_FAILED',
        detail: planningError.message,
      });
    }

    if (!planningMaterials || planningMaterials.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const planningMaterialIds = planningMaterials.map((pm) => pm.id);
    const planningMaterialUnitPriceMap = new Map<string, number | null>(
      planningMaterials.map((pm) => [pm.id, pm.unit_price ?? null])
    );

    const { data, error } = await supabase
      .from('Materials')
      .select(
        `*,
        materialDefinition:MaterialDefinitions (name, unit)
      `
      )
      .in('planning_material_id', planningMaterialIds)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch materials for project', {
        statusCode: 500,
        code: 'MATERIALS_FETCH_FAILED',
        detail: error.message,
      });
    }

    const sanitizedData = mapSanitizeCamelcase<MaterialRecord>(data || []) as Array<
      MaterialRecord & { unitPrice?: number | null; planningMaterialId?: string }
    >;
    const dataWithUnitPrice = sanitizedData.map((item) => {
      const unitPriceFromPlanning = item.planningMaterialId
        ? (planningMaterialUnitPriceMap.get(item.planningMaterialId) ?? null)
        : null;

      return {
        ...item,
        unitPrice: item.unitPrice ?? unitPriceFromPlanning ?? null,
      };
    });

    return res.status(200).json({
      success: true,
      data: dataWithUnitPrice,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get materials by project error');
  }
};

// Get all materials for a specific task
export const getMaterialsByTaskId = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;

    if (!taskId) {
      throw new AppError('Task ID is required', {
        statusCode: 400,
        code: 'TASK_ID_REQUIRED',
      });
    }

    const { data, error } = await supabase
      .from('Materials')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch materials for task', {
        statusCode: 500,
        code: 'MATERIALS_FETCH_FAILED',
        detail: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase<MaterialRecord>(data || []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get materials by task error');
  }
};

// Create a new material
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const {
      planning_material_id,
      material_definition_id,
      quantity,
      received_date_time,
      note,
      task_id,
    } = snakecaseKeys(req.body, { deep: true });

    if (!planning_material_id || !material_definition_id) {
      throw new AppError('Planning Material ID and Material Definition ID are required', {
        statusCode: 400,
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const materialToInsert: Omit<MaterialSnakeBody, 'id'> = {
      planning_material_id,
      material_definition_id,
      task_id: task_id || null,
      user_id: userId,
      quantity,
      received_date_time,
      note,
    };

    const { data, error } = await supabase
      .from('Materials')
      .insert(materialToInsert)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to create material', {
        statusCode: 500,
        code: 'MATERIAL_CREATE_FAILED',
        detail: error?.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: sanitizeAndCamelcase<MaterialRecord>(data),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create material error');
  }
};

// Update a material
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;
    if (!materialId) {
      throw new AppError('Material ID is required', {
        statusCode: 400,
        code: 'MATERIAL_ID_REQUIRED',
      });
    }

    const materialData = pickSnakeBody<MaterialSnakeBody>(req, MATERIAL_MUTABLE_COLUMNS);

    const { data, error } = await supabase
      .from('Materials')
      .update({
        ...materialData,
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to update material', {
        statusCode: 500,
        code: 'MATERIAL_UPDATE_FAILED',
        detail: error?.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: sanitizeAndCamelcase<MaterialRecord>(data),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Update material error');
  }
};

// Delete a material
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;
    if (!materialId) {
      throw new AppError('Material ID is required', {
        statusCode: 400,
        code: 'MATERIAL_ID_REQUIRED',
      });
    }

    const { error } = await supabase.from('Materials').delete().eq('id', materialId);

    if (error) {
      throw new AppError('Failed to delete material', {
        statusCode: 500,
        code: 'MATERIAL_DELETE_FAILED',
        detail: error.message,
      });
    }

    return res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Delete material error');
  }
};

// Batch create materials
export const batchCreateMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { materials } = snakecaseKeys(req.body, { deep: true }) as {
      materials?: Omit<MaterialSnakeBody, 'id' | 'user_id'>[];
    };

    if (!Array.isArray(materials) || materials.length === 0) {
      throw new AppError('Materials array is required', {
        statusCode: 400,
        code: 'MATERIALS_ARRAY_REQUIRED',
      });
    }

    const materialsToInsert = materials
      .filter((m) => m.planning_material_id && m.material_definition_id) // Filter if essential FKs are missing
      .map((m) => ({
        ...m,
        user_id: userId,
      }));

    if (materialsToInsert.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { data, error } = await supabase.from('Materials').insert(materialsToInsert).select();

    if (error) {
      throw new AppError('Failed to batch create materials', {
        statusCode: 500,
        code: 'MATERIAL_BATCH_CREATE_FAILED',
        detail: error.message,
      });
    }

    return res.status(201).json({ success: true, data: mapSanitizeCamelcase(data || []) });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Batch create materials error');
  }
};

// Batch update materials
export const batchUpdateMaterials = async (req: Request, res: Response) => {
  try {
    const { materials } = snakecaseKeys(req.body, { deep: true }) as {
      materials: (Partial<MaterialSnakeBody> & { id: string })[];
    };

    if (!Array.isArray(materials) || materials.length === 0) {
      throw new AppError('Materials array is required', {
        statusCode: 400,
        code: 'MATERIALS_ARRAY_REQUIRED',
      });
    }

    const updates = materials.map((m) => {
      const payload: Partial<MaterialSnakeBody> = {
        quantity: m.quantity,
        received_date_time: m.received_date_time ?? null,
        note: m.note,
        task_id: m.task_id,
      };

      // Filter out undefined values to avoid overwriting with them
      Object.keys(payload).forEach((key) => {
        if ((payload as Record<string, unknown>)[key] === undefined) {
          delete (payload as Record<string, unknown>)[key];
        }
      });

      return supabase.from('Materials').update(payload).eq('id', m.id).select();
    });

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      // Simple error handling for now, can be improved to return partial success
      throw new AppError('Failed to update some materials', {
        statusCode: 500,
        code: 'MATERIAL_BATCH_UPDATE_FAILED',
        detail: errors.map((e) => e.error?.message).join(', '),
      });
    }

    const updatedData = results.flatMap((r) => r.data || []);

    return res.status(200).json({ success: true, data: mapSanitizeCamelcase(updatedData) });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Batch update materials error');
  }
};

// Batch delete materials
export const batchDeleteMaterials = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Material IDs array is required', {
        statusCode: 400,
        code: 'MATERIAL_IDS_REQUIRED',
      });
    }

    const { error } = await supabase.from('Materials').delete().in('id', ids);

    if (error) {
      throw new AppError('Failed to batch delete materials', {
        statusCode: 500,
        code: 'MATERIAL_BATCH_DELETE_FAILED',
        detail: error.message,
      });
    }

    return res.status(200).json({ success: true, message: 'Materials deleted successfully' });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Batch delete materials error');
  }
};
