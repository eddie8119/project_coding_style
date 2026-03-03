import request from '@/utils/request';

export type SendFeedbackPayload = {
  subject: string;
  html: string;
  text?: string;
};

export const feedbackApi = {
  sendFeedback: (data: SendFeedbackPayload) => {
    return request.post('/feedback', data);
  },
};
