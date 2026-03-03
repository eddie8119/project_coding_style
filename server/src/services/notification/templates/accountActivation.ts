import { Language } from '@frontend/types/language';

import { footerBlock } from './partials/footer';
import { headerBlock } from './partials/header';

import { container } from '@/email';
import { getAccountActivationLocaleCopy } from '@/services/notification/locale/accountActivation';

interface AccountActivationData {
  email: string;
  activationLink: string;
  expiresIn?: string;
  userName?: string;
  locale?: Language;
}

/**
 * 生成帳戶激活郵件模板
 */
export const generateAccountActivationTemplate = (data: AccountActivationData): string => {
  const { email, activationLink, expiresIn = '24 小時', userName = '用戶', locale } = data;

  const copy = getAccountActivationLocaleCopy(locale ?? Language.ZH_TW);

  const inner = `
    ${headerBlock(copy.headerTitle)}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px;">
      <h2 style="margin-top: 0; color: #1565c0; font-size: 24px;">${copy.title}</h2>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        ${copy.greeting(userName)}
      </p>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        ${copy.description}
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationLink}" 
           style="display: inline-block; padding: 14px 32px; background-color: #2196f3; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          ${copy.buttonText}
        </a>
      </div>
      
      <p style="color: #777; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        ${copy.copyLinkLabel}
      </p>
      <p style="color: #2196f3; font-size: 13px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
        ${activationLink}
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
    
    <div style="margin: 20px 0; padding: 15px; background-color: #f0f4c3; border-left: 4px solid #cddc39; border-radius: 4px;">
      <p style="color: #558b2f; font-size: 14px; margin: 0; line-height: 1.6;">
        ${copy.tipText}
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};
