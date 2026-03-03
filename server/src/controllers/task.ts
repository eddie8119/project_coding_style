import { Request, Response } from 'express';

import { TASK_MUTABLE_COLUMNS } from '@/constants/mutableColumns';
import { supabase } from '@/lib/supabase';
import { MaterialSnakeBody, TaskSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

type TaskUpdatePayload = TaskSnakeBody & {
  id?: string;
  project_id?: string;
};

type MaterialRecord = MaterialSnakeBody & {
  user_id?: string;
  task_id?: string;
};

type TaskRecord = TaskSnakeBody & {
  id?: string;
  project_id?: string;
  Materials?: MaterialRecord[] | null;
  user_id?: string;
  materials?: MaterialRecord[] | null;
};

// 獲取該用戶的所有任務
export const getAllTasks = async (_req: Request, res: Response) => {
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('Tasks')
      .select('*, Materials(*)')
      .order('created_at', { ascending: false });

    if (tasksError) {
      throw new AppError('Failed to fetch tasks', {
        statusCode: 500,
        code: 'TASKS_FETCH_FAILED',
        detail: tasksError.message,
        exposeError: true,
      });
    }

    const processedTasks = mapSanitizeCamelcase<TaskRecord>(
      (tasks ?? []).map((task) => {
        const { Materials, ...rest } = task as TaskRecord;
        return {
          ...rest,
          materials: Materials || [],
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: processedTasks,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get all tasks error');
  }
};

// 獲取專案下的所有任務
export const getTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('Tasks')
      .select('*, Materials(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (tasksError) {
      throw new AppError('Failed to fetch tasks', {
        statusCode: 500,
        code: 'TASKS_FETCH_FAILED',
        detail: tasksError.message,
        exposeError: true,
      });
    }

    const processedTasks = mapSanitizeCamelcase<TaskRecord>(
      (tasks ?? []).map((task) => {
        const { Materials, ...rest } = task as TaskRecord;
        return {
          ...rest,
          materials: Materials || [],
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: processedTasks,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get tasks by project error');
  }
};

// 獲取單個任務詳情
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Task ID is required', {
        statusCode: 400,
        code: 'TASK_ID_REQUIRED',
      });
    }

    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .select(
        `
        *,
        Materials(*)
      `
      )
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new AppError('Task not found or you do not have permission to access it', {
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
        detail: taskError?.message,
        exposeError: Boolean(taskError?.message),
      });
    }

    const { Materials, ...taskData } = task as TaskRecord;
    const processedTask = sanitizeAndCamelcase<TaskRecord>({
      ...taskData,
      materials: Materials || [],
    });

    return res.status(200).json({
      success: true,
      data: processedTask,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get task by id error');
  }
};

// 創建新任務
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const {
      title,
      description,
      construction_type,
      reminder_date_time,
      materials,
      end_date_time,
      pin_location,
    } = pickSnakeBody<TaskSnakeBody>(req, [...TASK_MUTABLE_COLUMNS]);

    if (!title) {
      throw new AppError('Title is required', {
        statusCode: 400,
        code: 'TASK_TITLE_REQUIRED',
      });
    }

    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .insert([
        {
          title,
          description,
          construction_type,
          reminder_date_time,
          end_date_time,
          pin_location,
          project_id: projectId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (taskError || !task) {
      throw new AppError('Failed to create task', {
        statusCode: 500,
        code: 'TASK_CREATE_FAILED',
        detail: taskError?.message,
        exposeError: Boolean(taskError?.message),
      });
    }

    // 2. 如果有材料，創建材料記錄
    let materialRecords: MaterialRecord[] = [];
    if (materials && Array.isArray(materials) && materials.length > 0) {
      const validMaterials = materials.filter(
        (m) => m.planning_material_id && m.material_definition_id
      );

      if (validMaterials.length > 0) {
        const materialsToInsert = validMaterials.map((material) => ({
          planning_material_id: material.planning_material_id,
          material_definition_id: material.material_definition_id,
          task_id: task.id,
          user_id: userId,
          quantity: material.quantity,
          received_date_time: material.received_date_time ?? null,
          note: material.note,
        }));

        const { data: insertedMaterials, error: materialsError } = await supabase
          .from('Materials')
          .insert(materialsToInsert)
          .select('*');

        if (materialsError) {
          console.error('Error creating task materials:', materialsError);
          // 不中斷流程，但記錄錯誤
        } else {
          if (insertedMaterials && insertedMaterials.length > 0) {
            materialRecords = insertedMaterials;
          } else {
            const { data: fetchedMaterials, error: fetchMaterialsError } = await supabase
              .from('Materials')
              .select('*')
              .eq('task_id', task.id);

            if (fetchMaterialsError) {
              console.error('Error fetching task materials after insert:', fetchMaterialsError);
            } else {
              materialRecords = (fetchedMaterials as MaterialRecord[]) || [];
            }
          }
        }
      }
    }

    // 組合返回數據
    const taskWithMaterials = {
      ...task,
      materials: materialRecords,
    };

    const sanitizedTask = sanitizeAndCamelcase<TaskRecord>(taskWithMaterials);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: sanitizedTask,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create task error');
  }
};

// 更新任務
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Task ID is required', {
        statusCode: 400,
        code: 'TASK_ID_REQUIRED',
      });
    }

    const {
      title,
      description,
      construction_type,
      reminder_date_time,
      materials,
      status,
      end_date_time,
      pin_location,
    } = pickSnakeBody<TaskSnakeBody>(req, [...TASK_MUTABLE_COLUMNS]);

    // 更新 Tasks
    const { data: updatedTask, error: updateError } = await supabase
      .from('Tasks')
      .update({
        title,
        description,
        construction_type,
        reminder_date_time,
        end_date_time,
        status,
        pin_location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError || !updatedTask) {
      throw new AppError('Failed to update task', {
        statusCode: 500,
        code: 'TASK_UPDATE_FAILED',
        detail: updateError?.message,
        exposeError: Boolean(updateError?.message),
      });
    }

    // 處理材料
    let materialRecords: MaterialRecord[] = [];
    if (Array.isArray(materials)) {
      // 1. 先刪除原本的材料
      const { error: deleteError } = await supabase
        .from('Materials')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) {
        console.error('Error deleting task materials:', deleteError);
        // 不中斷流程，但記錄錯誤
      }

      const filteredMaterials = (materials as MaterialSnakeBody[]).filter(
        (m) => m.planning_material_id && m.material_definition_id
      );

      if (filteredMaterials.length > 0) {
        const materialsToInsert = filteredMaterials.map((material) => ({
          planning_material_id: material.planning_material_id,
          material_definition_id: material.material_definition_id,
          task_id: taskId,
          user_id: (req as AuthenticatedRequest).userId,
          quantity: material.quantity,
          received_date_time: material.received_date_time,
          note: material.note,
        }));

        const { data: insertedMaterials, error: materialsError } = await supabase
          .from('Materials')
          .insert(materialsToInsert)
          .select('*');

        if (materialsError) {
          console.error('Error updating task materials:', materialsError);
        } else if (insertedMaterials && insertedMaterials.length > 0) {
          materialRecords = insertedMaterials;
        } else {
          const { data: fetchedMaterials, error: fetchMaterialsError } = await supabase
            .from('Materials')
            .select('*')
            .eq('task_id', taskId);

          if (fetchMaterialsError) {
            console.error('Error fetching task materials after update:', fetchMaterialsError);
          } else {
            materialRecords = (fetchedMaterials as MaterialRecord[]) || [];
          }
        }
      }
    } else {
      // 前端沒有帶 materials，則保留原有材料
      const { data: existingMaterials } = await supabase
        .from('Materials')
        .select('*')
        .eq('task_id', taskId);

      materialRecords = (existingMaterials as MaterialRecord[]) || [];
    }

    // 組合返回數據
    const taskWithMaterials = {
      ...(updatedTask as TaskRecord),
      materials: materialRecords,
    };

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: sanitizeAndCamelcase<TaskRecord>(taskWithMaterials),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Update task error');
  }
};

// 批量更新任務
export const updateTasks = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    const { tasks } = pickSnakeBody<{ tasks?: TaskUpdatePayload[] }>(req, ['tasks']);

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      throw new AppError('Tasks array is required', {
        statusCode: 400,
        code: 'TASKS_REQUIRED',
      });
    }

    // 批量更新任務
    const updatedTasks: TaskRecord[] = [];
    const errors: string[] = [];

    // 使用 Promise.all 並行處理所有任務更新
    await Promise.all(
      tasks.map(async (task) => {
        try {
          // 確保任務屬於指定的專案
          if (task.project_id !== projectId) {
            errors.push(`Task ${task.id} does not belong to the specified project`);
            return;
          }

          // 更新任務
          const { data: updatedTask, error: updateError } = await supabase
            .from('Tasks')
            .update({
              title: task.title,
              description: task.description,
              construction_type: task.construction_type,
              reminder_date_time: task.reminder_date_time,
              end_date_time: task.end_date_time,
              status: task.status,
              pin_location: task.pin_location,
              updated_at: new Date().toISOString(),
            })
            .eq('id', task.id)
            .select()
            .single();

          if (updateError) {
            errors.push(`Error updating task ${task.id}: ${updateError.message}`);
            return;
          }

          // 處理材料更新
          if (task.materials) {
            // 刪除現有材料
            await supabase.from('Materials').delete().eq('task_id', task.id);

            // 插入新材料
            if (task.materials.length > 0) {
              const materialsToInsert = task.materials
                .filter((m) => m.planning_material_id && m.material_definition_id)
                .map((material) => ({
                  planning_material_id: material.planning_material_id,
                  material_definition_id: material.material_definition_id,
                  task_id: task.id,
                  user_id: (req as AuthenticatedRequest).userId,
                  quantity: material.quantity,
                  received_date_time: material.received_date_time,
                  note: material.note,
                }));

              const { data: insertedMaterials, error: materialsError } = await supabase
                .from('Materials')
                .insert(materialsToInsert)
                .select();

              if (materialsError) {
                errors.push(
                  `Error updating materials for task ${task.id}: ${materialsError.message}`
                );
              } else {
                updatedTasks.push({
                  ...updatedTask,
                  materials: insertedMaterials,
                });
              }
            } else {
              updatedTasks.push({
                ...updatedTask,
                materials: [],
              });
            }
          } else {
            // 如果沒有提供材料，獲取現有材料
            const { data: existingMaterials } = await supabase
              .from('Materials')
              .select('*')
              .eq('task_id', task.id);

            updatedTasks.push({
              ...updatedTask,
              materials: existingMaterials,
            });
          }
        } catch (error: unknown) {
          errors.push(
            `Unexpected error processing task ${task.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      })
    );

    // 返回結果
    return res.status(200).json({
      success: true,
      message:
        errors.length > 0 ? 'Some tasks updated with errors' : 'All tasks updated successfully',
      data: mapSanitizeCamelcase<TaskRecord>(updatedTasks as TaskRecord[]),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Update tasks error');
  }
};

// 刪除任務
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const taskId = req.params.id;

    if (!taskId) {
      throw new AppError('Task ID is required', {
        statusCode: 400,
        code: 'TASK_ID_REQUIRED',
      });
    }

    const { data: task, error: taskError } = await supabase
      .from('Tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      throw new AppError('Task not found or you do not have permission to delete it', {
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
        detail: taskError?.message,
        exposeError: Boolean(taskError?.message),
      });
    }

    const { error: materialsDeleteError } = await supabase
      .from('Materials')
      .delete()
      .eq('task_id', taskId)
      .eq('user_id', userId);

    if (materialsDeleteError) {
      throw new AppError('Failed to delete task materials', {
        statusCode: 500,
        code: 'TASK_MATERIALS_DELETE_FAILED',
        detail: materialsDeleteError.message,
        exposeError: true,
      });
    }

    const { error: taskDeleteError } = await supabase
      .from('Tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (taskDeleteError) {
      throw new AppError('Failed to delete task', {
        statusCode: 500,
        code: 'TASK_DELETE_FAILED',
        detail: taskDeleteError.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task and associated materials deleted successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Delete task error');
  }
};
