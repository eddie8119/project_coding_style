import { Language } from '@frontend/types/language';

import { container } from '@/email';
import {
  getInvitationLocaleCopy,
  getRoleDisplayName,
} from '@/services/notification/locale/invitation';
import { footerBlock } from '@/services/notification/templates/partials/footer';
import { headerBlock } from '@/services/notification/templates/partials/header';

export const generateInvitationTemplate = (
  inviterName: string,
  invitationType: 'project' | 'global',
  role: string,
  acceptUrl: string,
  projectName?: string,
  locale: Language = Language.ZH_TW
): string => {
  const localeCopy = getInvitationLocaleCopy(locale);
  const roleDisplayName = getRoleDisplayName(role, locale);
  const scopeCopy = invitationType === 'project' ? localeCopy.project : localeCopy.global;

  const invitationTitle = scopeCopy.title(projectName);
  const invitationDescription = scopeCopy.description(roleDisplayName);

  const inner = `
    ${headerBlock(localeCopy.headerTitle)}
    <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
      <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
        <strong>${inviterName}</strong> ${invitationTitle}
      </p>
      <p style="color: #555; margin-bottom: 10px;">
        ${invitationDescription}
      </p>
      <div style="margin: 10px 0; padding: 10px; background-color: #e8f4f8; border-left: 3px solid #3498db; border-radius: 3px;">
        <p style="color: #2980b9; margin: 0; font-size: 14px;">
          <strong>${localeCopy.roleLabel}：${roleDisplayName}</strong>
        </p>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" 
         style="display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        ${localeCopy.acceptButtonText}
      </a>
    </div>

    <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffc107;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        ${localeCopy.noteText}
      </p>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #777; font-size: 13px; margin-bottom: 10px;">
        ${localeCopy.expireText}
      </p>
    </div>

    ${footerBlock()}
  `;

  return container(inner);
};
