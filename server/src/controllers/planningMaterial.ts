import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { PLANNING_MATERIAL_MUTABLE_COLUMNS } from '@/constants/mutableColumns';
import { supabase } from '@/lib/supabase';
import { PlanningMaterialSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

// Get all planning materials for a project
export const getPlanningMaterials = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      throw new AppError('Project ID is required', { statusCode: 400 });
    }

    const { data, error } = await supabase
      .from('PlanningMaterial')
      .select(
        `
        *,
        materialDefinition:MaterialDefinitions (name, unit, default_unit_price)
      `
      )
      .eq('project_id', projectId);

    if (error) {
      throw new AppError('Failed to fetch planning materials', { detail: error.message });
    }

    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase(data || []),
    });
  } catch (error) {
    handleControllerError(res, error, 'Get planning materials error');
  }
};

// Get all planning materials for the current user (across projects)
export const getAllPlanningMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

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

    const projectIds = projects.map((project) => project.id);

    const { data, error } = await supabase
      .from('PlanningMaterial')
      .select(
        `
        *,
        materialDefinition:MaterialDefinitions (name, unit, default_unit_price)
      `
      )
      .in('project_id', projectIds);

    if (error) {
      throw new AppError('Failed to fetch planning materials', {
        statusCode: 500,
        code: 'PLANNING_MATERIALS_FETCH_FAILED',
        detail: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase(data || []),
    });
  } catch (error) {
    handleControllerError(res, error, 'Get all planning materials error');
  }
};

// Upsert a planning material (create or update)
export const upsertPlanningMaterial = async (req: Request, res: Response) => {
  try {
    const planningMaterialBody = pickSnakeBody<PlanningMaterialSnakeBody>(
      req,
      PLANNING_MATERIAL_MUTABLE_COLUMNS
    );

    const {
      project_id,
      construction,
      material_definition_id,
      planning_total_quantity,
      unit_price,
      note,
    } = planningMaterialBody;

    const normalizedConstruction =
      construction ??
      (req.body.construction as string | undefined) ??
      (req.body.constructionId as string | undefined) ??
      null;

    if (!project_id || !normalizedConstruction || !material_definition_id) {
      throw new AppError('Project ID, construction, and material definition ID are required', {
        statusCode: 400,
      });
    }

    const planning_total_price = (planning_total_quantity ?? 0) * (unit_price ?? 0);

    const upsertPayload: PlanningMaterialSnakeBody = {
      project_id,
      construction: normalizedConstruction,
      material_definition_id,
      planning_total_quantity: planning_total_quantity ?? null,
      planning_total_price: planning_total_price,
      unit_price: unit_price ?? null,
      note: note ?? null,
    };

    const { data, error } = await supabase
      .from('PlanningMaterial')
      .upsert(upsertPayload, {
        onConflict: 'project_id,construction,material_definition_id',
      })
      .select();

    if (error || !data || data.length === 0) {
      throw new AppError('Failed to upsert planning material', { detail: error?.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Planning material upserted successfully',
      data: sanitizeAndCamelcase(data[0]),
    });
  } catch (error) {
    handleControllerError(res, error, 'Upsert planning material error');
  }
};

// Batch upsert planning materials
export const batchUpsertPlanningMaterials = async (req: Request, res: Response) => {
  try {
    const { planning_materials: planningMaterials } = snakecaseKeys(req.body, {
      deep: true,
    }) as {
      planning_materials: PlanningMaterialSnakeBody[];
    };

    if (!Array.isArray(planningMaterials) || planningMaterials.length === 0) {
      throw new AppError('Planning materials array is required', {
        statusCode: 400,
        code: 'PLANNING_MATERIALS_ARRAY_REQUIRED',
      });
    }

    const processedMaterials = planningMaterials.map((material) => {
      const { planning_total_quantity, unit_price, ...rest } = material;
      const planning_total_price = (planning_total_quantity ?? 0) * (unit_price ?? 0);

      return {
        ...rest,
        planning_total_quantity: planning_total_quantity ?? null,
        unit_price: unit_price ?? null,
        planning_total_price,
      };
    });

    const { data, error } = await supabase
      .from('PlanningMaterial')
      .upsert(processedMaterials, {
        onConflict: 'project_id,construction,material_definition_id',
      })
      .select();

    if (error) {
      throw new AppError('Failed to batch upsert planning materials', {
        statusCode: 500,
        code: 'PLANNING_MATERIAL_BATCH_UPSERT_FAILED',
        detail: error.message,
      });
    }

    return res.status(200).json({ success: true, data: mapSanitizeCamelcase(data || []) });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Batch upsert planning materials error');
  }
};

// Delete a planning material by id
export const deletePlanningMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Planning material ID is required', { statusCode: 400 });
    }

    const { error } = await supabase.from('PlanningMaterial').delete().eq('id', id);

    if (error) {
      throw new AppError('Failed to delete planning material', {
        statusCode: 500,
        detail: error.message,
      });
    }

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    handleControllerError(res, error, 'Delete planning material error');
  }
};
