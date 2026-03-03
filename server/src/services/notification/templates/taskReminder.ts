import { Language } from '@frontend/types/language';

import { container, formatDateTime } from '@/email';
import { getTaskReminderLocaleCopy } from '@/services/notification/locale/taskReminder';
import { footerBlock } from '@/services/notification/templates/partials/footer';
import { headerBlock } from '@/services/notification/templates/partials/header';

export const generateTaskReminderTemplate = (
  task: Record<string, unknown>,
  locale: Language = Language.ZH_TW
): string => {
  const reminderTime = task.reminder_date_time
    ? formatDateTime(task.reminder_date_time as string | number | Date)
    : undefined;
  const copy = getTaskReminderLocaleCopy(locale);
  const reminderTimeDisplay = reminderTime ?? copy.notSetLabel;

  const inner = `
    ${headerBlock(copy.headerTitle)}
    <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
      <p style="color: #555; margin-bottom: 10px;">${task.description || copy.noDescription}</p>
      <p style="color: #777; font-size: 14px;">
        <strong>${copy.reminderTimeLabel}:</strong> ${reminderTimeDisplay}<br>
        <strong>${copy.statusLabel}:</strong> ${task.status}<br>
      </p>
    </div>
    ${footerBlock()}
  `;

  return container(inner);
};
