import { Language } from '@frontend/types/language';

import { roleNameMap } from '@/email';

interface InvitationScopeCopy {
  title: (projectName?: string) => string;
  description: (roleDisplayName: string) => string;
}

export interface InvitationLocaleCopy {
  projectSubject: (projectName?: string) => string;
  globalSubject: () => string;
  headerTitle: string;
  acceptButtonText: string;
  noteText: string;
  expireText: string;
  roleLabel: string;
  project: InvitationScopeCopy;
  global: InvitationScopeCopy;
}

const invitationLocaleMap: Record<Language, InvitationLocaleCopy> = {
  [Language.EN]: {
    projectSubject: (projectName?: string) =>
      `Collaboration Invitation${projectName ? `: ${projectName}` : ''}`.trim(),
    globalSubject: () => 'Collaboration Invitation: Global Project Access',
    headerTitle: 'Collaboration Invitation',
    acceptButtonText: 'Accept Invitation',
    noteText:
      "Note: If you don't have an account yet, clicking Accept will guide you through the sign-up process.",
    expireText:
      'This invitation will expire in 7 days. If you do not wish to accept it, you can safely ignore this email.',
    roleLabel: 'Role Permission',
    project: {
      title: (projectName?: string) =>
        `invites you to be a collaborator on project "${projectName ?? ''}"`.trim(),
      description: (roleDisplayName: string) =>
        `You will be able to access and manage this project as "${roleDisplayName}".`,
    },
    global: {
      title: () => 'invites you to be a global project collaborator',
      description: (roleDisplayName: string) =>
        `You will be able to access all projects as "${roleDisplayName}".`,
    },
  },
  [Language.JA]: {
    projectSubject: (projectName?: string) =>
      `コラボレーション招待${projectName ? `：${projectName}` : ''}`.trim(),
    globalSubject: () => 'コラボレーション招待：グローバルアクセス',
    headerTitle: 'コラボレーション招待',
    acceptButtonText: '招待を承諾する',
    noteText: 'まだアカウントをお持ちでない場合は、招待を承諾すると登録画面に遷移します。',
    expireText:
      'この招待は 7 日後に失効します。招待を承諾しない場合は、本メールを無視していただいて構いません。',
    roleLabel: 'ロール権限',
    project: {
      title: (projectName?: string) =>
        `プロジェクト「${projectName ?? ''}」のコラボレーターとして招待されています`.trim(),
      description: (roleDisplayName: string) =>
        `「${roleDisplayName}」の権限でこのプロジェクトにアクセスおよび管理できます。`,
    },
    global: {
      title: () => 'グローバルプロジェクトのコラボレーターとして招待されています',
      description: (roleDisplayName: string) =>
        `「${roleDisplayName}」の権限で全てのプロジェクトにアクセスできます。`,
    },
  },
  [Language.ZH_TW]: {
    projectSubject: (projectName?: string) => `協作邀請：${projectName ?? ''}`.trim(),
    globalSubject: () => '協作邀請：全域專案協作者',
    headerTitle: '協作邀請',
    acceptButtonText: '接受邀請',
    noteText: '注意：如果您尚未註冊帳號，點擊接受邀請後將引導您完成註冊流程。',
    expireText: '此邀請將在 7 天後過期。如果您不想接受此邀請，可以忽略此郵件。',
    roleLabel: '角色權限',
    project: {
      title: (projectName?: string) => `邀請您成為專案「${projectName ?? ''}」的協作者`.trim(),
      description: (roleDisplayName: string) =>
        `您將可以以「${roleDisplayName}」的身份訪問和管理該專案。`,
    },
    global: {
      title: () => '邀請您成為全域專案協作者',
      description: (roleDisplayName: string) =>
        `您將可以以「${roleDisplayName}」的身份訪問所有專案。`,
    },
  },
};

const roleDisplayNameMap: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    viewer: 'Viewer',
    editor: 'Editor',
    manager: 'Manager',
  },
  [Language.JA]: {
    viewer: '閲覧者',
    editor: '編集者',
    manager: '管理者',
  },
  [Language.ZH_TW]: {
    viewer: '瀏覽者',
    editor: '編輯者',
    manager: '管理員',
  },
};

const getInvitationLocaleCopy = (locale: Language = Language.ZH_TW): InvitationLocaleCopy => {
  return invitationLocaleMap[locale] || invitationLocaleMap[Language.ZH_TW];
};

const getRoleDisplayName = (role: string, locale: Language): string => {
  return roleDisplayNameMap[locale]?.[role] || roleNameMap[role] || role;
};

export { getInvitationLocaleCopy, getRoleDisplayName };
