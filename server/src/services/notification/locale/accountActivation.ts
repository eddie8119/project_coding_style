import { Language } from '@frontend/types/language';

export interface AccountActivationLocaleCopy {
  subject: string;
  headerTitle: string;
  title: string;
  greeting: (userName: string) => string;
  description: string;
  buttonText: string;
  copyLinkLabel: string;
  expiresLabel: (expiresIn: string) => string;
  emailLabel: (email: string) => string;
  tipText: string;
}

const zhTW: AccountActivationLocaleCopy = {
  subject: '驗證您的 KaiJi 帳戶',
  headerTitle: '驗證您的電子郵件',
  title: '✉️ 驗證您的電子郵件地址',
  greeting: (userName: string) => `親愛的 ${userName}，`,
  description: '感謝您註冊 KaiJi 帳戶！為了完成註冊流程，請驗證您的電子郵件地址。',
  buttonText: '驗證電子郵件',
  copyLinkLabel: '或複製以下連結到瀏覽器：',
  expiresLabel: (expiresIn: string) => `⏰ 此連結將在 ${expiresIn} 後過期`,
  emailLabel: (email: string) => `📧 此郵件發送至：${email}`,
  tipText: '💡 提示：如果您沒有建立此帳戶，請忽略此郵件。',
};

const accountActivationLocaleMap: Record<Language, AccountActivationLocaleCopy> = {
  [Language.ZH_TW]: zhTW,
  [Language.EN]: {
    ...zhTW,
    subject: 'Verify your KaiJi account',
    headerTitle: 'Verify your email',
    title: '✉️ Verify your email address',
    greeting: (userName: string) => `Hi ${userName},`,
    description:
      'Thanks for signing up! To finish creating your KaiJi account, please verify your email address.',
    buttonText: 'Verify email',
    copyLinkLabel: 'Or copy this link into your browser:',
    expiresLabel: (expiresIn: string) => `⏰ This link expires in ${expiresIn}`,
    emailLabel: (email: string) => `📧 Sent to: ${email}`,
    tipText: '💡 Tip: If you did not create this account, please ignore this email.',
  },
  [Language.JA]: {
    ...zhTW,
    subject: 'KaiJi アカウントを認証してください',
    headerTitle: 'メールアドレスの確認',
    title: '✉️ メールアドレスをご確認ください',
    greeting: (userName: string) => `親愛なる ${userName} 様`,
    description:
      'KaiJi にご登録いただきありがとうございます。登録を完了するには、メールアドレスを確認してください。',
    buttonText: 'メールを確認する',
    copyLinkLabel: 'または下記のリンクをブラウザに貼り付けてください：',
    expiresLabel: (expiresIn: string) => `⏰ このリンクは ${expiresIn} で期限切れになります`,
    emailLabel: (email: string) => `📧 送信先：${email}`,
    tipText: '💡 ヒント：このアカウントに覚えがない場合は、このメールを無視してください。',
  },
};

export const getAccountActivationLocaleCopy = (
  locale: Language = Language.ZH_TW
): AccountActivationLocaleCopy => {
  return accountActivationLocaleMap[locale] || accountActivationLocaleMap[Language.ZH_TW];
};
