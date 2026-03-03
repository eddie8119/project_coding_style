import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { CommonSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { sanitizeAndCamelcase } from '@/utils/formatters';

const COMMON_FIELDS = [
  'construction',
  'unit',
  'project_type',
] as const satisfies readonly (keyof CommonSnakeBody & string)[];

export const getCommon = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError('User not authenticated', {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
      });
    }

    const { data, error } = await supabase.from('Common').select('*').eq('user_id', userId);

    if (error) {
      console.error('Error fetching commons:', error);
      throw new AppError('Failed to fetch common items', {
        statusCode: 500,
        code: 'COMMON_FETCH_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    if (data && data.length > 0) {
      return res.status(200).json({
        success: true,
        data: sanitizeAndCamelcase(data[0]),
      });
    }

    return res.status(200).json({ success: true, data: null });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Server error fetching commons');
  }
};

export const createCommon = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId ?? req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { construction, unit, project_type } = pickSnakeBody<CommonSnakeBody>(req, [
    ...COMMON_FIELDS,
  ]);

  if (!construction && !unit && !project_type) {
    return res.status(400).json({
      success: false,
      message: 'Either construction or unit or project_type must be provided.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('Common')
      .insert([
        {
          user_id: userId,
          construction,
          unit,
          project_type,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating common item:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to create common item', error: error.message });
    }

    // .single() 回傳的是單一物件，不是陣列
    if (data) {
      return res.status(201).json({
        success: true,
        data: sanitizeAndCamelcase(data),
      });
    }

    // 理論上不會到這裡，保險起見還是回覆 500
    return res.status(500).json({ success: false, message: 'Failed to create common item' });
  } catch (error) {
    console.error('Server error creating common item:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

export const updateCommon = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId ?? req.user?.id;
  const { id } = req.params;
  const { construction, unit, project_type } = pickSnakeBody<CommonSnakeBody>(req, [
    ...COMMON_FIELDS,
  ]);

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!construction && !unit && !project_type) {
    return res.status(400).json({
      success: false,
      message: 'Either construction or unit or project_type must be provided.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('Common')
      .update({
        construction,
        unit,
        project_type,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating common item:', error);
      return res.status(404).json({
        success: false,
        message: 'Common item not found or failed to update',
        error: error.message,
      });
    }

    // .single() 回傳的是單一物件，不是陣列
    if (data) {
      return res.status(200).json({
        success: true,
        data: sanitizeAndCamelcase(data),
      });
    }

    // 若沒有找到資料，視為 404
    return res.status(404).json({
      success: false,
      message: 'Common item not found',
    });
  } catch (error) {
    console.error('Server error updating common item:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};

export const deleteCommon = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { error } = await supabase.from('Common').delete().eq('id', id).eq('user_id', userId);

    if (error) {
      console.error('Error deleting common item:', error);
      return res.status(404).json({
        success: false,
        message: 'Common item not found or failed to delete',
        error: error.message,
      });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Server error deleting common item:', error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
};
