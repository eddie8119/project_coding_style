import { Language } from '@frontend/types/language';

import { container, formatDateTime } from '@/email';
import { getDailyDigestLocaleCopy } from '@/services/notification/locale/dailyDigest';
import { footerBlock } from '@/services/notification/templates/partials/footer';
import { headerBlock } from '@/services/notification/templates/partials/header';

export const generateDailyDigestTemplate = (
  tasks: Record<string, unknown>[],
  locale: Language = Language.ZH_TW
): string => {
  const copy = getDailyDigestLocaleCopy(locale);
  const today = new Date().toLocaleDateString(locale);
  const taskListHtml = tasks
    .map((task) => {
      const reminderTime = task.reminder_date_time
        ? formatDateTime(task.reminder_date_time as string | number | Date, locale)
        : copy.noDescription;
      return `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
          <p style="color: #555; margin-bottom: 10px;">${task.description || copy.noDescription}</p>
          <p style="color: #777; font-size: 14px;">
            <strong>${copy.reminderTimeLabel}:</strong> ${reminderTime}<br>
            <strong>${copy.statusLabel}:</strong> ${task.status}<br>
          </p>
        </div>
      `;
    })
    .join('');

  const inner = `
    ${headerBlock(`${copy.headerTitlePrefix} - ${today}`)}
    <p>${copy.introText(tasks.length)}</p>
    <div style="margin: 20px 0;">
      ${taskListHtml}
    </div>
    ${footerBlock(copy.footerNote)}
  `;

  return container(inner);
};
