import { Request, Response } from 'express';

import { PLANNING_TASK_MUTABLE_COLUMNS } from '@/constants/mutableColumns';
import { supabase } from '@/lib/supabase';
import { PlanningTaskSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

// 獲取單個規劃任務詳情
export const getPlanningTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Planning Task ID is required', {
        statusCode: 400,
        code: 'PLANNING_TASK_ID_REQUIRED',
      });
    }

    // 查詢規劃任務詳情
    const { data: planningTask, error: planningTaskError } = await supabase
      .from('PlanningTasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (planningTaskError) {
      console.error('Error fetching planning task:', planningTaskError);
      throw new AppError('Planning task not found or you do not have permission to access it', {
        statusCode: 404,
        code: 'PLANNING_TASK_NOT_FOUND',
        detail: planningTaskError.message,
        exposeError: true,
      });
    }

    const sanitizedTask = sanitizeAndCamelcase(planningTask);

    return res.status(200).json({
      success: true,
      data: sanitizedTask,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching planning task');
  }
};

// 創建新規劃任務
export const createPlanningTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const { construction_type, content, start_date, end_date } =
      pickSnakeBody<PlanningTaskSnakeBody>(req, [...PLANNING_TASK_MUTABLE_COLUMNS]);

    // 驗證必要欄位
    if (!content) {
      throw new AppError('Content is required', {
        statusCode: 400,
        code: 'PLANNING_TASK_CONTENT_REQUIRED',
      });
    }

    // 創建規劃任務
    const { data: planningTask, error: planningTaskError } = await supabase
      .from('PlanningTasks')
      .insert([
        {
          construction_type,
          content,
          start_date,
          end_date,
          project_id: projectId,
          user_id: userId,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (planningTaskError) {
      console.error('Error creating planning task:', planningTaskError);
      throw new AppError('Failed to create planning task', {
        statusCode: 500,
        code: 'PLANNING_TASK_CREATE_FAILED',
        detail: planningTaskError.message,
        exposeError: true,
      });
    }

    const sanitizedTask = sanitizeAndCamelcase(planningTask);

    return res.status(201).json({
      success: true,
      message: 'Planning task created successfully',
      data: sanitizedTask,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error creating planning task');
  }
};

// 更新規劃任務
export const updatePlanningTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Planning Task ID is required', {
        statusCode: 400,
        code: 'PLANNING_TASK_ID_REQUIRED',
      });
    }

    const { construction_type, content, start_date, end_date } =
      pickSnakeBody<PlanningTaskSnakeBody>(req, [...PLANNING_TASK_MUTABLE_COLUMNS]);

    // 更新規劃任務
    const { data: updatedTask, error: updateError } = await supabase
      .from('PlanningTasks')
      .update({
        construction_type,
        content,
        start_date,
        end_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating planning task:', updateError);
      throw new AppError('Failed to update planning task', {
        statusCode: 500,
        code: 'PLANNING_TASK_UPDATE_FAILED',
        detail: updateError.message,
        exposeError: true,
      });
    }

    const sanitizedTask = sanitizeAndCamelcase(updatedTask);

    return res.status(200).json({
      success: true,
      message: 'Planning task updated successfully',
      data: sanitizedTask,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error updating planning task');
  }
};

// 刪除規劃任務
export const deletePlanningTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Planning Task ID is required', {
        statusCode: 400,
        code: 'PLANNING_TASK_ID_REQUIRED',
      });
    }

    // 刪除規劃任務
    const { error: taskDeleteError } = await supabase
      .from('PlanningTasks')
      .delete()
      .eq('id', taskId)
      .select()
      .single();

    if (taskDeleteError) {
      console.error('Error deleting planning task:', taskDeleteError);
      throw new AppError('Failed to delete planning task', {
        statusCode: 500,
        code: 'PLANNING_TASK_DELETE_FAILED',
        detail: taskDeleteError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Planning task deleted successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error deleting planning task');
  }
};

// 批量
// 獲取該用戶的所有規劃任務
export const getAllPlanningTasks = async (_req: Request, res: Response) => {
  try {
    const { data: planningTasks, error: planningTasksError } = await supabase
      .from('PlanningTasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (planningTasksError) {
      console.error('Error fetching planning tasks:', planningTasksError);
      throw new AppError('Failed to fetch planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_FETCH_FAILED',
        detail: planningTasksError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase(planningTasks ?? []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching planning tasks');
  }
};

// 獲取專案下的所有規劃任務
export const getPlanningTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    // 查詢專案下的所有規劃任務
    const { data: planningTasks, error: planningTasksError } = await supabase
      .from('PlanningTasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (planningTasksError) {
      console.error('Error fetching planning tasks:', planningTasksError);
      throw new AppError('Failed to fetch planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_FETCH_FAILED',
        detail: planningTasksError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase(planningTasks ?? []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching planning tasks');
  }
};

//
export const createPlanningTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const { planning_tasks } = pickSnakeBody<{
      planning_tasks?: PlanningTaskSnakeBody[];
    }>(req, ['planning_tasks']);

    if (!planning_tasks || !Array.isArray(planning_tasks) || planning_tasks.length === 0) {
      throw new AppError('Planning tasks array is required', {
        statusCode: 400,
        code: 'PLANNING_TASKS_REQUIRED',
      });
    }

    const invalidTask = planning_tasks.find((task) => !task.content || task.content.trim() === '');
    if (invalidTask) {
      throw new AppError('Each planning task must have content', {
        statusCode: 400,
        code: 'PLANNING_TASK_CONTENT_REQUIRED',
      });
    }

    const now = new Date().toISOString();
    const insertPayload = planning_tasks.map((task) => ({
      construction_type: task.construction_type ?? null,
      content: task.content as string,
      start_date: task.start_date ?? null,
      end_date: task.end_date ?? null,
      project_id: projectId,
      user_id: userId,
      updated_at: now,
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from('PlanningTasks')
      .insert(insertPayload)
      .select('*');

    if (insertError) {
      console.error('Error creating planning tasks:', insertError);
      throw new AppError('Failed to create planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_CREATE_FAILED',
        detail: insertError.message,
        exposeError: true,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Planning tasks created successfully',
      data: mapSanitizeCamelcase(insertedTasks ?? []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error creating planning tasks');
  }
};

// 批次替換專案規劃任務（先刪除舊的，再建立新的）
export const replacePlanningTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;
    const { planningTasks } = req.body;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    if (!Array.isArray(planningTasks)) {
      throw new AppError('planningTasks must be an array', {
        statusCode: 400,
        code: 'PLANNING_TASKS_REQUIRED',
      });
    }

    // 驗證每個任務都有 content
    for (const task of planningTasks) {
      if (!task.content || task.content.trim() === '') {
        throw new AppError('Each planning task must have content', {
          statusCode: 400,
          code: 'PLANNING_TASK_CONTENT_REQUIRED',
        });
      }
    }

    // 1. 刪除該專案下的所有舊任務
    const { error: deleteError } = await supabase
      .from('PlanningTasks')
      .delete()
      .eq('project_id', projectId)
      .select();

    if (deleteError) {
      console.error('Error deleting old planning tasks:', deleteError);
      throw new AppError('Failed to delete old planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_DELETE_FAILED',
        detail: deleteError.message,
        exposeError: true,
      });
    }

    // 2. 建立新任務
    const snakeCaseTasks = planningTasks.map((task) => ({
      project_id: projectId,
      user_id: userId,
      construction_type: task.constructionType || null,
      content: task.content,
      start_date: task.startDate || null,
      end_date: task.endDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: createdTasks, error: createError } = await supabase
      .from('PlanningTasks')
      .insert(snakeCaseTasks)
      .select();

    if (createError) {
      console.error('Error creating planning tasks:', createError);
      throw new AppError('Failed to create planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_CREATE_FAILED',
        detail: createError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Planning tasks replaced successfully',
      data: mapSanitizeCamelcase(createdTasks ?? []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error replacing planning tasks');
  }
};

// 刪除專案下的所有規劃任務
export const deletePlanningTaskByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // 刪除該專案下的所有規劃任務
    const { error: deleteError } = await supabase
      .from('PlanningTasks')
      .delete()
      .eq('project_id', projectId)
      .select();

    if (deleteError) {
      console.error('Error deleting planning tasks:', deleteError);
      throw new AppError('Failed to delete planning tasks', {
        statusCode: 500,
        code: 'PLANNING_TASKS_DELETE_FAILED',
        detail: deleteError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Planning tasks deleted successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error deleting planning tasks');
  }
};
