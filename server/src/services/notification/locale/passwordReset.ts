import { Language } from '@frontend/types/language';

export interface PasswordResetLocaleCopy {
  subject: string;
  headerTitle: string;
  title: string;
  greeting: string;
  description: string;
  buttonText: string;
  copyLinkLabel: string;
  expiresLabel: (expiresIn: string) => string;
  emailLabel: (email: string) => string;
  securityTip: string;
}

export interface PasswordChangedLocaleCopy {
  subject: string;
  headerTitle: string;
  title: string;
  greeting: string;
  description: string;
  accountLabel: (email: string) => string;
  changedAtLabel: (time: string) => string;
  warningText: string;
}

const zhTWReset: PasswordResetLocaleCopy = {
  subject: '重置您的密碼',
  headerTitle: '重置密碼',
  title: '重置您的密碼',
  greeting: '您好，',
  description: '我們收到了您的密碼重置請求。請點擊下方按鈕來重置您的密碼：',
  buttonText: '重置密碼',
  copyLinkLabel: '或複製以下連結到瀏覽器：',
  expiresLabel: (expiresIn: string) => `⏰ 此連結將在 ${expiresIn} 後過期`,
  emailLabel: (email: string) => `📧 此郵件發送至：${email}`,
  securityTip: '⚠️ 安全提示：如果您沒有要求重置密碼，請忽略此郵件。您的密碼不會被更改。',
};

const zhTWChanged: PasswordChangedLocaleCopy = {
  subject: '密碼已成功更改',
  headerTitle: '密碼已更改',
  title: '✓ 密碼更改成功',
  greeting: '您好，',
  description: '您的帳戶密碼已成功更改。',
  accountLabel: (email: string) => `📧 帳戶：${email}`,
  changedAtLabel: (time: string) => `🕐 更改時間：${time}`,
  warningText: '🔒 如果這不是您的操作：請立即聯繫我們的客服團隊，您的帳戶可能已被盜用。',
};

const passwordResetLocaleMap: Record<Language, PasswordResetLocaleCopy> = {
  [Language.ZH_TW]: zhTWReset,
  [Language.EN]: {
    ...zhTWReset,
    subject: 'Reset your password',
    headerTitle: 'Reset Password',
    title: 'Reset your password',
    greeting: 'Hello,',
    description:
      'We received a request to reset your password. Click the button below to continue:',
    buttonText: 'Reset password',
    copyLinkLabel: 'Or copy this link into your browser:',
    expiresLabel: (expiresIn: string) => `⏰ This link will expire in ${expiresIn}`,
    emailLabel: (email: string) => `📧 Sent to: ${email}`,
    securityTip:
      '⚠️ Security tip: If you did not request a reset, you can safely ignore this email. Your password will remain unchanged.',
  },
  [Language.JA]: {
    ...zhTWReset,
    subject: 'パスワードの再設定',
    headerTitle: 'パスワード再設定',
    title: 'パスワードを再設定する',
    greeting: 'こんにちは、',
    description:
      'パスワード再設定のリクエストを受け取りました。以下のボタンをクリックして続行してください。',
    buttonText: 'パスワードを再設定',
    copyLinkLabel: 'または以下のリンクをブラウザに貼り付けてください：',
    expiresLabel: (expiresIn: string) => `⏰ このリンクは ${expiresIn} で期限切れになります`,
    emailLabel: (email: string) => `📧 送信先：${email}`,
    securityTip: '⚠️ セキュリティのため：心当たりがない場合は、このメールを無視してください。',
  },
};

const passwordChangedLocaleMap: Record<Language, PasswordChangedLocaleCopy> = {
  [Language.ZH_TW]: zhTWChanged,
  [Language.EN]: {
    ...zhTWChanged,
    subject: 'Your password has been changed',
    headerTitle: 'Password Changed',
    title: '✓ Password updated successfully',
    greeting: 'Hello,',
    description: 'Your account password has been updated.',
    accountLabel: (email: string) => `📧 Account: ${email}`,
    changedAtLabel: (time: string) => `🕐 Changed at: ${time}`,
    warningText:
      '🔒 If this was not you, please contact support immediately as your account may be compromised.',
  },
  [Language.JA]: {
    ...zhTWChanged,
    subject: 'パスワードが変更されました',
    headerTitle: 'パスワード変更',
    title: '✓ パスワードの更新が完了しました',
    greeting: 'こんにちは、',
    description: 'あなたのアカウントのパスワードが更新されました。',
    accountLabel: (email: string) => `📧 アカウント：${email}`,
    changedAtLabel: (time: string) => `🕐 変更時間：${time}`,
    warningText: '🔒 心当たりがない場合は、直ちにサポートまでご連絡ください。',
  },
};

export const getPasswordResetLocaleCopy = (
  locale: Language = Language.ZH_TW
): PasswordResetLocaleCopy => {
  return passwordResetLocaleMap[locale] || passwordResetLocaleMap[Language.ZH_TW];
};

export const getPasswordChangedLocaleCopy = (
  locale: Language = Language.ZH_TW
): PasswordChangedLocaleCopy => {
  return passwordChangedLocaleMap[locale] || passwordChangedLocaleMap[Language.ZH_TW];
};
