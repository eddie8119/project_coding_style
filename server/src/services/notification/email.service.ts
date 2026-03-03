import { Language } from '@frontend/types/language';

import type { CollaboratorRole, InvitationType } from '@/types/response';

import { supabase } from '@/lib/supabase';
import { getAccountActivationLocaleCopy } from '@/services/notification/locale/accountActivation';
import { getNotificationSenderLocaleCopy } from '@/services/notification/locale/common';
import { getDailyDigestLocaleCopy } from '@/services/notification/locale/dailyDigest';
import { getInvitationLocaleCopy } from '@/services/notification/locale/invitation';
import {
  getPasswordChangedLocaleCopy,
  getPasswordResetLocaleCopy,
} from '@/services/notification/locale/passwordReset';
import { getTaskReminderLocaleCopy } from '@/services/notification/locale/taskReminder';
import { sendMail } from '@/services/notification/mailer';
import { generateAccountActivationTemplate } from '@/services/notification/templates/accountActivation';
import { generateDailyDigestTemplate } from '@/services/notification/templates/dailyDigest';
import { generateInvitationTemplate } from '@/services/notification/templates/invitation';
import {
  generatePasswordChangedTemplate,
  generatePasswordResetTemplate,
} from '@/services/notification/templates/passwordReset';
import { generateTaskReminderTemplate } from '@/services/notification/templates/taskReminder';

// 用於發送任務提醒和每日摘要
export class EmailService {
  // 發送單個任務提醒郵件
  async sendTaskReminder(
    userId: string,
    task: Record<string, unknown>,
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) {
        console.error('獲取用戶郵箱失敗');
        return false;
      }

      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const reminderCopy = getTaskReminderLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.taskReminder;
      const subject = `${reminderCopy.subjectPrefix}: ${task.title || ''}`;

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: userData.user.email,
        subject,
        html: generateTaskReminderTemplate(task, locale),
      });

      return true;
    } catch (error) {
      console.error('發送任務提醒郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送每日任務摘要郵件
   */
  async sendDailyDigest(
    userId: string,
    tasks: Record<string, unknown>[],
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      if (tasks.length === 0) {
        return true;
      }

      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) {
        console.error('獲取用戶郵箱失敗');
        return false;
      }

      const { data: settings } = await supabase
        .from('UserSettings')
        .select('email_notifications_enabled')
        .eq('user_id', userId)
        .single();

      if (settings?.email_notifications_enabled === false) {
        console.log(`用戶 ${userId} 已禁用郵件通知`);
        return true;
      }

      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const digestCopy = getDailyDigestLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.dailyDigest;
      const subject = `${digestCopy.subjectPrefix} - ${new Date().toLocaleDateString(locale)}`;

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: userData.user.email,
        subject,
        html: generateDailyDigestTemplate(tasks, locale),
      });

      return true;
    } catch (error) {
      console.error('發送每日摘要郵件失敗:', error);
      return false;
    }
  }

  // 發送協作者邀請郵件
  async sendCollaboratorInvitation(
    inviterName: string,
    inviteeEmail: string,
    invitationType: InvitationType,
    role: CollaboratorRole,
    invitationToken: string,
    projectName?: string,
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const acceptUrl = `${frontendUrl}/invitation/accept?token=${invitationToken}`;

      const invitationCopy = getInvitationLocaleCopy(locale);
      const subject =
        invitationType === 'project'
          ? invitationCopy.projectSubject(projectName)
          : invitationCopy.globalSubject();
      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.collaboratorInvitation;

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: inviteeEmail,
        subject,
        html: generateInvitationTemplate(
          inviterName,
          invitationType,
          role,
          acceptUrl,
          projectName,
          locale
        ),
      });

      return true;
    } catch (error) {
      console.error('發送協作邀請郵件失敗:', error);
      return false;
    }
  }

  // 發送帳戶激活郵件
  async sendActivationEmail(
    email: string,
    activationToken: string,
    userName?: string,
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const activationLink = `${frontendUrl}/auth/account-activation?token=${activationToken}&email=${encodeURIComponent(email)}`;

      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.activation;
      const copy = getAccountActivationLocaleCopy(locale);
      const expiresIn =
        locale === Language.EN ? '24 hours' : locale === Language.JA ? '24 時間' : '24 小時';

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: copy.subject,
        html: generateAccountActivationTemplate({
          email,
          activationLink,
          expiresIn,
          userName,
          locale,
        }),
      });
      return true;
    } catch (error) {
      console.error('[sendActivationEmail] Failed to send activation email to', email, error);
      return false;
    }
  }

  // 發送密碼重置郵件
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.security;
      const copy = getPasswordResetLocaleCopy(locale);
      const expiresIn =
        locale === Language.EN ? '1 hour' : locale === Language.JA ? '1 時間' : '1 小時';

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: copy.subject,
        html: generatePasswordResetTemplate({
          email,
          resetLink,
          expiresIn,
          locale,
        }),
      });

      return true;
    } catch (error) {
      console.error('發送密碼重置郵件失敗:', error);
      return false;
    }
  }

  // 發送密碼更改成功通知郵件
  async sendPasswordChangedNotification(
    email: string,
    locale: Language = Language.ZH_TW
  ): Promise<boolean> {
    try {
      const senderCopy = getNotificationSenderLocaleCopy(locale);
      const fromName = process.env.EMAIL_FROM_NAME || senderCopy.security;
      const copy = getPasswordChangedLocaleCopy(locale);

      await sendMail({
        from: `"${fromName}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: copy.subject,
        html: generatePasswordChangedTemplate(email, locale),
      });

      return true;
    } catch (error) {
      console.error('發送密碼更改通知郵件失敗:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
