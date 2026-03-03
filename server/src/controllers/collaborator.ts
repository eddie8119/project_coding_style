import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { GlobalCollaboratorSnakeBody, ProjectCollaboratorSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';

const PROJECT_COLLAB_FIELDS = [
  'collaborator_email',
  'role',
] as const satisfies readonly (keyof ProjectCollaboratorSnakeBody & string)[];

const GLOBAL_COLLAB_FIELDS = [
  'collaborator_email',
  'role',
] as const satisfies readonly (keyof GlobalCollaboratorSnakeBody & string)[];

// ==================== Project Collaborators ====================

// Get all collaborators for a specific project (includes global collaborators)
export const getProjectCollaborators = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;

    if (!projectId) {
      throw new AppError('Project ID is required', {
        statusCode: 400,
        code: 'PROJECT_ID_REQUIRED',
      });
    }

    // Fetch project owner to hydrate global collaborator query and validate access context
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new AppError('Project not found', {
        statusCode: 404,
        code: 'PROJECT_NOT_FOUND',
        detail: projectError?.message,
        exposeError: true,
      });
    }

    // Get project-specific collaborators for this project.
    // RLS on ProjectCollaborators ensures only owners/collaborators see rows.
    const { data: projectCollaborators, error: projectCollabError } = await supabase
      .from('ProjectCollaborators')
      .select('*')
      .eq('project_id', projectId);

    if (projectCollabError) {
      console.error('Error fetching project collaborators:', projectCollabError);
      throw new AppError('Failed to fetch project collaborators', {
        statusCode: 500,
        code: 'PROJECT_COLLAB_FETCH_FAILED',
        detail: projectCollabError.message,
        exposeError: true,
      });
    }

    const isOwnerView = project.user_id === userId;
    const isCollaboratorView = (projectCollaborators || []).some(
      (pc: any) => pc.collaborator_user_id && pc.collaborator_user_id === userId
    );

    if (!isOwnerView && !isCollaboratorView) {
      throw new AppError('You do not have permission to view collaborators for this project', {
        statusCode: 403,
        code: 'PROJECT_COLLAB_FORBIDDEN',
      });
    }

    // Get global collaborators for this owner (RLS restricts to current user).
    const { data: globalCollaborators, error: globalError } = await supabase
      .from('GlobalCollaborators')
      .select('*')
      .eq('owner_id', project.user_id);

    if (globalError) {
      console.error('Error fetching global collaborators:', globalError);
      throw new AppError('Failed to fetch global collaborators', {
        statusCode: 500,
        code: 'GLOBAL_COLLAB_FETCH_FAILED',
        detail: globalError.message,
        exposeError: true,
      });
    }

    // Collect collaborator emails and resolve names from Supabase Auth
    const collaboratorEmails = [
      ...(projectCollaborators || []).map((pc: any) => pc.collaborator_email),
      ...(globalCollaborators || []).map((gc: any) => gc.collaborator_email),
    ];

    const userNameMap = await buildUserNameMapByEmails(collaboratorEmails);

    // Create a map of project collaborators by email for quick lookup
    const projectCollabMap = new Map(
      (projectCollaborators || []).map((pc: any) => [pc.collaborator_email, pc])
    );

    // Merge collaborators: project-specific override global
    const mergedCollaborators: any[] = [];

    // Add all project-specific collaborators
    (projectCollaborators || []).forEach((pc: any) => {
      mergedCollaborators.push({
        id: pc.id,
        project_id: pc.project_id,
        owner_id: pc.owner_id,
        collaborator_email: pc.collaborator_email,
        collaborator_name: userNameMap.get(pc.collaborator_email) ?? null,
        role: pc.role,
        is_global: false,
        global_role: null,
        created_at: pc.created_at,
        updated_at: pc.updated_at,
      });
    });

    // Add global collaborators (if not overridden by project-specific)
    (globalCollaborators || []).forEach((gc: any) => {
      const projectCollab = projectCollabMap.get(gc.collaborator_email);
      if (projectCollab) {
        // Update existing entry to include global role info
        const existing = mergedCollaborators.find(
          (c) => c.collaborator_email === gc.collaborator_email
        );
        if (existing) {
          existing.is_global = true;
          existing.global_role = gc.role;
        }
      } else {
        // Add as global collaborator
        mergedCollaborators.push({
          id: gc.id,
          project_id: projectId,
          owner_id: project.user_id,
          collaborator_email: gc.collaborator_email,
          collaborator_name: userNameMap.get(gc.collaborator_email) ?? null,
          role: gc.role,
          is_global: true,
          global_role: gc.role,
          created_at: gc.created_at,
          updated_at: gc.updated_at,
        });
      }
    });

    // Sort by created_at descending
    mergedCollaborators.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(mergedCollaborators, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching project collaborators');
  }
};

// Get all global collaborators for the authenticated user
export const getGlobalCollaborators = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const { data: collaborators, error } = await supabase
      .from('GlobalCollaborators')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching global collaborators:', error);
      throw new AppError('Failed to fetch global collaborators', {
        statusCode: 500,
        code: 'GLOBAL_COLLAB_FETCH_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    const collaboratorEmails = (collaborators || []).map((gc: any) => gc.collaborator_email);
    const userNameMap = await buildUserNameMapByEmails(collaboratorEmails);

    const enrichedCollaborators = (collaborators || []).map((gc: any) => ({
      ...gc,
      collaborator_name: userNameMap.get(gc.collaborator_email) ?? null,
    }));

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(enrichedCollaborators, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching global collaborators');
  }
};

// Get all collaborators across all projects owned by the user
export const getAllProjectCollaborators = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    // Get all project-specific collaborators where current user is owner.
    // RLS on ProjectCollaborators already restricts to auth.uid() = owner_id.
    const { data: projectCollaborators, error: projectError } = await supabase
      .from('ProjectCollaborators')
      .select('*')
      .eq('owner_id', userId);

    if (projectError) {
      console.error('Error fetching project collaborators:', projectError);
      throw new AppError('Failed to fetch project collaborators', {
        statusCode: 500,
        code: 'PROJECT_COLLAB_FETCH_FAILED',
        detail: projectError.message,
        exposeError: true,
      });
    }

    // Get global collaborators
    const { data: globalCollaborators, error: globalError } = await supabase
      .from('GlobalCollaborators')
      .select('*')
      .eq('owner_id', userId);

    if (globalError) {
      console.error('Error fetching global collaborators:', globalError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch global collaborators',
        error: globalError.message,
      });
    }

    // Collect collaborator emails and resolve names from Supabase Auth
    const collaboratorEmails = [
      ...(projectCollaborators || []).map((pc: any) => pc.collaborator_email),
      ...(globalCollaborators || []).map((gc: any) => gc.collaborator_email),
    ];

    const userNameMap = await buildUserNameMapByEmails(collaboratorEmails);

    // Create a map of project collaborators by email for quick lookup
    const projectCollabMap = new Map(
      (projectCollaborators || []).map((pc: any) => [pc.collaborator_email, pc])
    );

    // Merge collaborators: project-specific override global
    const mergedCollaborators: any[] = [];

    // Add all project-specific collaborators
    (projectCollaborators || []).forEach((pc: any) => {
      mergedCollaborators.push({
        id: pc.id,
        project_id: pc.project_id,
        owner_id: pc.owner_id,
        collaborator_email: pc.collaborator_email,
        collaborator_name: userNameMap.get(pc.collaborator_email) ?? null,
        role: pc.role,
        is_global: false,
        global_role: null,
        created_at: pc.created_at,
        updated_at: pc.updated_at,
      });
    });

    // Add global collaborators (if not overridden by project-specific)
    (globalCollaborators || []).forEach((gc: any) => {
      const projectCollab = projectCollabMap.get(gc.collaborator_email);
      if (!projectCollab) {
        // Add as global collaborator (only if not already in project-specific)
        mergedCollaborators.push({
          id: gc.id,
          project_id: null,
          owner_id: userId,
          collaborator_email: gc.collaborator_email,
          collaborator_name: userNameMap.get(gc.collaborator_email) ?? null,
          role: gc.role,
          is_global: true,
          global_role: gc.role,
          created_at: gc.created_at,
          updated_at: gc.updated_at,
        });
      }
    });

    // Sort by created_at descending
    mergedCollaborators.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(mergedCollaborators, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error fetching all project collaborators');
  }
};

// Add a collaborator to a specific project
export const addProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;
    const { collaborator_email, role } = pickSnakeBody<ProjectCollaboratorSnakeBody>(req, [
      ...PROJECT_COLLAB_FIELDS,
    ]);
    const resolvedRole = role ?? 'viewer';

    if (!projectId || !collaborator_email) {
      throw new AppError('Project ID and collaborator email are required', {
        statusCode: 400,
        code: 'COLLABORATOR_INPUT_REQUIRED',
      });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('Projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      throw new AppError('Project not found or you do not have permission', {
        statusCode: 404,
        code: 'PROJECT_NOT_FOUND',
        detail: projectError?.message,
        exposeError: true,
      });
    }

    // Check if collaborator already exists
    const { data: existingCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      throw new AppError('Collaborator already exists for this project', {
        statusCode: 409,
        code: 'COLLABORATOR_ALREADY_EXISTS',
      });
    }

    // Add the collaborator
    const { data: collaborator } = await supabase
      .from('ProjectCollaborators')
      .insert([
        {
          project_id: projectId,
          owner_id: userId,
          collaborator_email,
          role: resolvedRole,
        },
      ])
      .select()
      .single();

    if (!collaborator) {
      console.error('Error adding project collaborator:');
      throw new AppError('Failed to add collaborator', {
        statusCode: 500,
        code: 'PROJECT_COLLAB_ADD_FAILED',
        exposeError: true,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error adding project collaborator');
  }
};

// Update a collaborator on a specific project
export const updateProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { projectId, collaboratorId } = req.params;
    const { role } = pickSnakeBody<ProjectCollaboratorSnakeBody>(req, ['role']);

    if (!projectId || !collaboratorId || !role) {
      throw new AppError('Project ID, collaborator ID, and role are required', {
        statusCode: 400,
        code: 'COLLABORATOR_INPUT_REQUIRED',
      });
    }

    const { error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      throw new AppError('Project not found or you do not have permission', {
        statusCode: 404,
        code: 'PROJECT_NOT_FOUND',
        detail: projectError.message,
        exposeError: true,
      });
    }

    const { data: collaborator, error } = await supabase
      .from('ProjectCollaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project collaborator:', error);
      throw new AppError('Failed to update collaborator', {
        statusCode: 500,
        code: 'PROJECT_COLLAB_UPDATE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collaborator updated successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error updating project collaborator');
  }
};

// Remove a collaborator from a specific project
export const removeProjectCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { projectId, collaboratorId } = req.params;

    if (!projectId || !collaboratorId) {
      throw new AppError('Project ID and collaborator ID are required', {
        statusCode: 400,
        code: 'COLLABORATOR_INPUT_REQUIRED',
      });
    }

    const { error: projectError } = await supabase
      .from('Projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      throw new AppError('Project not found or you do not have permission', {
        statusCode: 404,
        code: 'PROJECT_NOT_FOUND',
        detail: projectError.message,
        exposeError: true,
      });
    }

    const { error } = await supabase
      .from('ProjectCollaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error removing project collaborator:', error);
      throw new AppError('Failed to remove collaborator', {
        statusCode: 500,
        code: 'PROJECT_COLLAB_REMOVE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error removing project collaborator');
  }
};

// Add a global collaborator
export const addGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { collaborator_email, role } = pickSnakeBody<GlobalCollaboratorSnakeBody>(req, [
      ...GLOBAL_COLLAB_FIELDS,
    ]);
    const resolvedRole = role ?? 'viewer';

    if (!collaborator_email) {
      throw new AppError('Collaborator email is required', {
        statusCode: 400,
        code: 'COLLABORATOR_EMAIL_REQUIRED',
      });
    }

    // Check if collaborator already exists
    const { data: existingCollaborator } = await supabase
      .from('GlobalCollaborators')
      .select('id')
      .eq('owner_id', userId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      throw new AppError('Global collaborator already exists', {
        statusCode: 409,
        code: 'GLOBAL_COLLABORATOR_EXISTS',
      });
    }

    // Add the global collaborator
    const { data: collaborator, error } = await supabase
      .from('GlobalCollaborators')
      .insert([
        {
          owner_id: userId,
          collaborator_email,
          role: resolvedRole,
        },
      ])
      .select()
      .single();

    if (error || !collaborator) {
      console.error('Error adding global collaborator:', error);
      throw new AppError('Failed to add global collaborator', {
        statusCode: 500,
        code: 'GLOBAL_COLLAB_ADD_FAILED',
        detail: error?.message,
        exposeError: true,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Global collaborator added successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error adding global collaborator');
  }
};

// Update a global collaborator's role
export const updateGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { collaboratorId } = req.params;
    const { role } = pickSnakeBody<GlobalCollaboratorSnakeBody>(req, ['role']);

    if (!collaboratorId || !role) {
      throw new AppError('Collaborator ID and role are required', {
        statusCode: 400,
        code: 'COLLABORATOR_INPUT_REQUIRED',
      });
    }

    // Update the global collaborator
    const { data: collaborator, error } = await supabase
      .from('GlobalCollaborators')
      .update({ role })
      .eq('id', collaboratorId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating global collaborator:', error);
      throw new AppError('Failed to update global collaborator', {
        statusCode: 500,
        code: 'GLOBAL_COLLAB_UPDATE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Global collaborator updated successfully',
      data: camelcaseKeys(collaborator, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error updating global collaborator');
  }
};

// Remove a global collaborator
export const removeGlobalCollaborator = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { collaboratorId } = req.params;

    if (!collaboratorId) {
      throw new AppError('Collaborator ID is required', {
        statusCode: 400,
        code: 'COLLABORATOR_ID_REQUIRED',
      });
    }

    // Remove the global collaborator
    const { error } = await supabase
      .from('GlobalCollaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('owner_id', userId);

    if (error) {
      console.error('Error removing global collaborator:', error);
      throw new AppError('Failed to remove global collaborator', {
        statusCode: 500,
        code: 'GLOBAL_COLLAB_REMOVE_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Global collaborator removed successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Unexpected error removing global collaborator');
  }
};

// ==================== Helper Functions ====================

// Check if a user has access to a project (either as owner, project collaborator, or global collaborator)
// Project-specific permissions override global permissions
export const checkProjectAccess = async (
  projectId: string,
  userEmail: string
): Promise<{ hasAccess: boolean; role?: string; isOwner: boolean }> => {
  try {
    // Check if user is the owner
    const { data: project } = await supabase
      .from('Projects')
      .select('user_id, Users!inner(email)')
      .eq('id', projectId)
      .single();

    if (project && (project as any).Users?.email === userEmail) {
      return { hasAccess: true, role: 'owner', isOwner: true };
    }

    // Check if user is a project-specific collaborator (priority over global)
    const { data: projectCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('role')
      .eq('project_id', projectId)
      .eq('collaborator_email', userEmail)
      .single();

    if (projectCollaborator) {
      // Project-specific role takes precedence
      return { hasAccess: true, role: projectCollaborator.role, isOwner: false };
    }

    // Check if user is a global collaborator (fallback if no project-specific role)
    if (project) {
      const { data: globalCollaborator } = await supabase
        .from('GlobalCollaborators')
        .select('role')
        .eq('owner_id', (project as any).user_id)
        .eq('collaborator_email', userEmail)
        .single();

      if (globalCollaborator) {
        // Use global role if no project-specific override exists
        return { hasAccess: true, role: globalCollaborator.role, isOwner: false };
      }
    }

    return { hasAccess: false, isOwner: false };
  } catch (error) {
    console.error('Error checking project access:', error);
    return { hasAccess: false, isOwner: false };
  }
};

// Build a map from collaborator email to display name using Supabase Auth
const buildUserNameMapByEmails = async (emails: string[]): Promise<Map<string, string | null>> => {
  const uniqueEmails = Array.from(new Set(emails)).filter(Boolean) as string[];
  const userNameMap = new Map<string, string | null>();

  if (uniqueEmails.length === 0) {
    return userNameMap;
  }

  // Query users by email instead of listing all users for better performance and security
  const { data: users, error } = await supabase
    .from('Users')
    .select('email, name')
    .in('email', uniqueEmails);

  if (error) {
    console.error('Error fetching users by email:', error);
    // Return an empty map on error, or handle it as needed
    return userNameMap;
  }

  // Populate the map
  users.forEach((u) => {
    if (u.email) {
      userNameMap.set(u.email, u.name || u.email);
    }
  });

  return userNameMap;
};
