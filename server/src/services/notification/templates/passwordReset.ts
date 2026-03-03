import { Language } from '@frontend/types/language';

import { footerBlock } from './partials/footer';
import { headerBlock } from './partials/header';

import { container } from '@/email';
import {
  getPasswordChangedLocaleCopy,
  getPasswordResetLocaleCopy,
} from '@/services/notification/locale/passwordReset';

interface PasswordResetData {
  email: string;
  resetLink: string;
  expiresIn?: string;
  locale?: Language;
}

/**
 * 生成密碼重置郵件模板
 */
export const generatePasswordResetTemplate = (data: PasswordResetData): string => {
  const { email, resetLink, expiresIn = '1 小時', locale } = data;
  const copy = getPasswordResetLocaleCopy(locale ?? Language.ZH_TW);

  const inner = `
    ${headerBlock(copy.headerTitle)}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h2 style="margin-top: 0; color: #2c3e50; font-size: 24px;">${copy.title}</h2>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        ${copy.greeting}
      </p>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        ${copy.description}
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; padding: 14px 32px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          ${copy.buttonText}
        </a>
      </div>
      
      <p style="color: #777; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        ${copy.copyLinkLabel}
      </p>
      <p style="color: #3498db; font-size: 14px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
        ${resetLink}
      </p>
      
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 5px 0;">
          <strong>${copy.expiresLabel(expiresIn)}</strong>
        </p>
        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 5px 0;">
          ${copy.emailLabel(email)}
        </p>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
        ${copy.securityTip}
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};

/**
 * 生成密碼更改成功通知郵件模板
 */
export const generatePasswordChangedTemplate = (
  email: string,
  locale: Language = Language.ZH_TW
): string => {
  const copy = getPasswordChangedLocaleCopy(locale);
  const inner = `
    ${headerBlock(copy.headerTitle)}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #155724; font-size: 24px;">${copy.title}</h2>
      
      <p style="color: #155724; line-height: 1.6; margin-bottom: 15px;">
        ${copy.greeting}
      </p>
      
      <p style="color: #155724; line-height: 1.6; margin-bottom: 15px;">
        ${copy.description}
      </p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-radius: 4px;">
        <p style="color: #555; font-size: 14px; margin: 5px 0;">
          ${copy.accountLabel(email)}
        </p>
        <p style="color: #555; font-size: 14px; margin: 5px 0;">
          ${copy.changedAtLabel(new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }))}
        </p>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
      <p style="color: #721c24; font-size: 14px; margin: 0; line-height: 1.6;">
        ${copy.warningText}
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};
