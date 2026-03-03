// utils/accessControl.ts
import { supabase } from '@/lib/supabase';
import { AppError } from '@/utils/controllerError';

type ProjectRecord = {
  id: string;
  user_id: string;
  [key: string]: unknown;
};

type UserRecord = {
  email: string | null;
};

type CollaboratorRecord = {
  id: string;
};

type AssertProjectAccessResult = {
  project: ProjectRecord;
  userEmail: string | null;
};

export async function assertOwnedRecord<T>(
  table: string,
  id: string,
  userId: string,
  options?: {
    select?: string; // 預設 'id'
    notFoundCode?: string; // e.g. 'PLANNING_TASK_NOT_FOUND'
    notFoundMessage?: string; // e.g. 'Planning task not found or you do not have permission'
  }
): Promise<T> {
  const {
    select = 'id',
    notFoundCode = 'RESOURCE_NOT_FOUND',
    notFoundMessage = 'Resource not found',
  } = options ?? {};

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error(`Error asserting ownership on ${table}:`, error);
    throw new AppError(notFoundMessage, {
      statusCode: 404,
      code: notFoundCode,
      detail: error?.message,
      exposeError: true,
    });
  }

  return data as T;
}

// 專案存取權限
export async function assertProjectAccess(
  projectId: string,
  userId: string
): Promise<AssertProjectAccessResult> {
  // 1. 先拿 email（多個地方都在用）
  const { data: user, error: userError } = await supabase
    .from('Users')
    .select('email')
    .eq('id', userId)
    .single<UserRecord>();

  if (userError) {
    console.error('Error fetching user email:', userError);
    throw new AppError('Failed to verify user email for project access', {
      statusCode: 500,
      code: 'USER_EMAIL_FETCH_FAILED',
      detail: userError.message,
      exposeError: true,
    });
  }

  const userEmail = user?.email ?? null;

  // 2. 查專案
  const { data: project, error: projectError } = await supabase
    .from('Projects')
    .select('*')
    .eq('id', projectId)
    .single<ProjectRecord>();

  if (projectError || !project) {
    console.error('Error fetching project:', projectError);
    throw new AppError('Project not found', {
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
      detail: projectError?.message,
      exposeError: true,
    });
  }

  // 3. 判斷是否有權限（owner / project collaborator / global collaborator）
  const isOwner = project.user_id === userId;

  const { data: projectCollaborator } = await supabase
    .from('ProjectCollaborators')
    .select('id')
    .eq('project_id', projectId)
    .eq('collaborator_email', userEmail)
    .maybeSingle<CollaboratorRecord>();

  const { data: globalCollaborator } = await supabase
    .from('GlobalCollaborators')
    .select('id')
    .eq('owner_id', project.user_id)
    .eq('collaborator_email', userEmail)
    .maybeSingle<CollaboratorRecord>();

  const hasAccess = Boolean(isOwner || projectCollaborator || globalCollaborator);

  if (!hasAccess) {
    throw new AppError('You do not have permission to access this project', {
      statusCode: 403,
      code: 'PROJECT_ACCESS_FORBIDDEN',
    });
  }

  return { project, userEmail };
}
