import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { DraftSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { mapSanitizeCamelcase, sanitizeAndCamelcase } from '@/utils/formatters';

const DRAFT_FIELDS = ['tasks'] as const satisfies readonly (keyof DraftSnakeBody & string)[];

// Create a new draft
export const createDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { tasks } = pickSnakeBody<DraftSnakeBody>(req, [...DRAFT_FIELDS]);

    if (!userId) {
      throw new AppError('User not authenticated', {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
      });
    }

    // Check if a draft already exists for this user
    const { data: existingDraft, error: fetchError } = await supabase
      .from('Draft')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing draft:', fetchError);
      throw new AppError('Error checking for existing draft', {
        statusCode: 500,
        code: 'DRAFT_FETCH_FAILED',
        detail: fetchError.message,
        exposeError: true,
      });
    }

    if (existingDraft) {
      throw new AppError('Draft already exists for this user.', {
        statusCode: 409,
        code: 'DRAFT_EXISTS',
      });
    }

    // Create a new draft
    const { data: newDraft, error: createError } = await supabase
      .from('Draft')
      .insert({
        user_id: userId,
        tasks: Array.isArray(tasks) ? tasks : [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating draft:', createError);
      throw new AppError('Failed to create draft', {
        statusCode: 500,
        code: 'DRAFT_CREATE_FAILED',
        detail: createError.message,
        exposeError: true,
      });
    }

    const sanitizedDraft = sanitizeAndCamelcase(newDraft);

    return res.status(201).json({
      success: true,
      data: sanitizedDraft,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error in createDraft');
  }
};

// Get a single draft by ID
export const getDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError('User not authenticated', {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
      });
    }

    const { data, error } = await supabase.from('Draft').select('*').eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Draft not found', {
          statusCode: 404,
          code: 'DRAFT_NOT_FOUND',
        });
      }
      console.error('Error fetching draft:', error);
      throw new AppError('Failed to fetch draft', {
        statusCode: 500,
        code: 'DRAFT_FETCH_FAILED',
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
    return res.status(200).json({
      success: true,
      data: mapSanitizeCamelcase(data ?? []),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error in getDraft');
  }
};

// Update a draft
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const { tasks } = pickSnakeBody<DraftSnakeBody>(req, [...DRAFT_FIELDS]);

    if (!userId) {
      throw new AppError('User not authenticated', {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
      });
    }

    if (!Array.isArray(tasks)) {
      throw new AppError('tasks must be an array.', {
        statusCode: 400,
        code: 'INVALID_TASKS_PAYLOAD',
      });
    }

    const { data: updatedDraft, error } = await supabase
      .from('Draft')
      .update({
        tasks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new AppError('Draft not found', {
          statusCode: 404,
          code: 'DRAFT_NOT_FOUND',
        });
      }
      console.error('Error updating draft:', error);
      throw new AppError('Failed to update draft', {
        statusCode: 500,
        code: 'DRAFT_UPDATE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    const sanitizedDraft = sanitizeAndCamelcase(updatedDraft);

    return res.status(200).json({
      success: true,
      message: 'Draft updated successfully',
      data: sanitizedDraft,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error updating draft');
  }
};

// Delete a draft
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
      });
    }

    const { error } = await supabase.from('Draft').delete().eq('id', id).eq('user_id', userId);

    if (error) {
      console.error('Error deleting draft:', error);
      throw new AppError('Failed to delete draft', {
        statusCode: 500,
        code: 'DRAFT_DELETE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    return res.status(200).json({ success: true, message: 'Draft deleted successfully' });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error deleting draft');
  }
};
