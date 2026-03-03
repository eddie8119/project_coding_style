import { Language } from '@frontend/types/language';
import camelcaseKeys from 'camelcase-keys';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/notification/email.service';
import { GlobalCollaboratorSnakeBody, ProjectCollaboratorSnakeBody } from '@/types/requestBody';
import { AuthenticatedRequest } from '@/types/requests';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';

const COLLABORATOR_FIELDS = [
  'collaborator_email',
  'role',
  'locale',
] as const satisfies readonly (keyof ProjectCollaboratorSnakeBody &
  keyof GlobalCollaboratorSnakeBody &
  string)[];

// ==================== Create Invitations ====================
// Create a project collaboration invitation
export const createProjectInvitation = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const projectId = req.params.projectId;
    const { collaborator_email, role, locale } = pickSnakeBody<ProjectCollaboratorSnakeBody>(req, [
      ...COLLABORATOR_FIELDS,
    ]);
    const resolvedRole = role ?? 'viewer';
    const inviterEmail = req.user?.email || undefined;
    const inviterName = req.user?.name ?? inviterEmail ?? collaborator_email ?? 'Someone';

    if (!projectId || !collaborator_email) {
      throw new AppError('Project ID and collaborator email are required', {
        statusCode: 400,
        code: 'INVITATION_MISSING_PARAMS',
      });
    }

    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('CollaboratorInvitations')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('invitee_email', collaborator_email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      throw new AppError('A pending invitation already exists for this email', {
        statusCode: 409,
        code: 'INVITATION_ALREADY_EXISTS',
      });
    }

    // Check if user is already a collaborator
    const { data: existingCollaborator } = await supabase
      .from('ProjectCollaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      throw new AppError('User is already a collaborator on this project', {
        statusCode: 409,
        code: 'COLLABORATOR_ALREADY_EXISTS',
      });
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .insert([
        {
          invitation_type: 'project',
          project_id: projectId,
          inviter_id: userId,
          inviter_email: inviterEmail,
          inviter_name: inviterName,
          invitee_email: collaborator_email,
          role: resolvedRole,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      // Log full Supabase error for debugging
      console.error('Supabase error while creating project invitation:', error);

      throw new AppError('Failed to create invitation', {
        statusCode: 500,
        code: 'INVITATION_CREATE_FAILED',
        detail: error.message ?? String(error),
        exposeError: true,
      });
    }

    // Fetch project title for email context
    const { data: projectData } = await supabase
      .from('Projects')
      .select('title')
      .eq('id', projectId)
      .single();
    const projectTitle = projectData?.title ?? 'your project';

    // Send invitation email

    await emailService.sendCollaboratorInvitation(
      inviterName,
      collaborator_email,
      'project',
      resolvedRole,
      invitationToken,
      projectTitle,
      locale || Language.ZH_TW
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: camelcaseKeys(invitation, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create project invitation error');
  }
};

// Create a global collaboration invitation
export const createGlobalInvitation = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { collaborator_email, role, locale } = pickSnakeBody<GlobalCollaboratorSnakeBody>(req, [
      ...COLLABORATOR_FIELDS,
    ]);
    const resolvedRole = role ?? 'viewer';
    const inviterEmail = req.user?.email || undefined;
    const inviterName = req.user?.name ?? inviterEmail ?? collaborator_email ?? 'Someone';

    if (!collaborator_email) {
      throw new AppError('Collaborator email is required', {
        statusCode: 400,
        code: 'INVITATION_MISSING_PARAMS',
      });
    }

    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('CollaboratorInvitations')
      .select('id, status')
      .eq('invitation_type', 'global')
      .eq('inviter_id', userId)
      .eq('invitee_email', collaborator_email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      throw new AppError('A pending invitation already exists for this email', {
        statusCode: 409,
        code: 'INVITATION_ALREADY_EXISTS',
      });
    }

    // Check if user is already a global collaborator
    const { data: existingCollaborator } = await supabase
      .from('GlobalCollaborators')
      .select('id')
      .eq('owner_id', userId)
      .eq('collaborator_email', collaborator_email)
      .single();

    if (existingCollaborator) {
      throw new AppError('User is already a global collaborator', {
        statusCode: 409,
        code: 'COLLABORATOR_ALREADY_EXISTS',
      });
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .insert([
        {
          invitation_type: 'global',
          project_id: null,
          inviter_id: userId,
          inviter_email: inviterEmail,
          inviter_name: inviterName,
          invitee_email: collaborator_email,
          role: resolvedRole,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error while creating global invitation:', error);

      throw new AppError('Failed to create invitation', {
        statusCode: 500,
        code: 'INVITATION_CREATE_FAILED',
        detail: error.message ?? String(error),
        exposeError: true,
      });
    }

    // Send invitation email

    await emailService.sendCollaboratorInvitation(
      inviterName,
      collaborator_email,
      'global',
      resolvedRole,
      invitationToken,
      undefined,
      locale || Language.ZH_TW
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: camelcaseKeys(invitation, { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create global invitation error');
  }
};

// ==================== Get Invitations ====================
// Get all invitations for the current user (received)
export const getMyInvitations = async (req: Request, res: Response) => {
  try {
    // Get all pending invitations visible to current user (RLS by invitee_email)
    const { data: invitations, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch invitations', {
        statusCode: 500,
        code: 'INVITATIONS_FETCH_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(invitations || [], { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get my invitations error');
  }
};

// Get invitations sent by the current user
export const getSentInvitations = async (req: Request, res: Response) => {
  try {
    const { data: invitations, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch sent invitations', {
        statusCode: 500,
        code: 'INVITATIONS_FETCH_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(invitations || [], { deep: true }),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get sent invitations error');
  }
};

// ==================== Accept/Reject Invitations ====================
// Accept an invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationToken } = req.params;

    if (!invitationToken) {
      throw new AppError('Invitation token is required', {
        statusCode: 400,
        code: 'INVITATION_TOKEN_REQUIRED',
      });
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('CollaboratorInvitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      throw new AppError('Invitation not found or already processed', {
        statusCode: 404,
        code: 'INVITATION_NOT_FOUND',
      });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new AppError('Invitation has expired', {
        statusCode: 410,
        code: 'INVITATION_EXPIRED',
      });
    }

    // Add collaborator based on type
    if (invitation.invitation_type === 'project') {
      const { error: collabError } = await supabase.from('ProjectCollaborators').insert([
        {
          project_id: invitation.project_id,
          owner_id: invitation.inviter_id,
          collaborator_email: invitation.invitee_email,
          collaborator_user_id: (req as AuthenticatedRequest).userId,
          role: invitation.role,
        },
      ]);

      if (collabError) {
        throw new AppError('Failed to add collaborator', {
          statusCode: 500,
          code: 'COLLABORATOR_ADD_FAILED',
        });
      }
    } else {
      const { error: collabError } = await supabase.from('GlobalCollaborators').insert([
        {
          owner_id: invitation.inviter_id,
          collaborator_email: invitation.invitee_email,
          collaborator_user_id: (req as AuthenticatedRequest).userId,
          role: invitation.role,
        },
      ]);

      if (collabError) {
        throw new AppError('Failed to add collaborator', {
          statusCode: 500,
          code: 'COLLABORATOR_ADD_FAILED',
        });
      }
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('CollaboratorInvitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation status:', updateError);
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Accept invitation error');
  }
};

// Reject an invitation
export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params;

    // Update invitation status
    const { error } = await supabase
      .from('CollaboratorInvitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId)
      .eq('status', 'pending');

    if (error) {
      throw new AppError('Failed to reject invitation', {
        statusCode: 500,
        code: 'INVITATION_REJECT_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation rejected successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Reject invitation error');
  }
};

// Cancel a sent invitation (by inviter)
export const cancelInvitation = async (req: Request, res: Response) => {
  try {
    const { invitationId } = req.params;

    // Delete the invitation
    const { error } = await supabase
      .from('CollaboratorInvitations')
      .delete()
      .eq('id', invitationId)
      .eq('status', 'pending')
      .eq('inviter_id', (req as AuthenticatedRequest).userId);

    if (error) {
      throw new AppError('Failed to cancel invitation', {
        statusCode: 500,
        code: 'INVITATION_CANCEL_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation canceled successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Cancel invitation error');
  }
};

// Get invitation details by token (for unauthenticated users)
export const getInvitationByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { data: invitation, error } = await supabase
      .from('CollaboratorInvitations')
      .select('*, Projects(title)')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      throw new AppError('Invitation not found or already processed', {
        statusCode: 404,
        code: 'INVITATION_NOT_FOUND',
      });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new AppError('Invitation has expired', {
        statusCode: 410,
        code: 'INVITATION_EXPIRED',
      });
    }
    const inviterName = invitation.inviter_name || invitation.inviter_email;

    return res.status(200).json({
      success: true,
      data: camelcaseKeys(
        {
          ...invitation,
          inviter_name: inviterName,
        },
        { deep: true }
      ),
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get invitation by token error');
  }
};
