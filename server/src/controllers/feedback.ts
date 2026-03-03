import type { Request, Response } from 'express';

import { sendMail } from '@/services/notification/mailer';
import { handleControllerError } from '@/utils/controllerError';

export const sendFeedback = async (req: Request, res: Response) => {
  try {
    const { subject, html, text } = req.body as {
      subject?: string;
      html?: string;
      text?: string;
    };

    if (!subject || !html) {
      return res.status(400).json({ success: false, message: 'subject and html are required' });
    }

    const to = process.env.FEEDBACK_TO || process.env.EMAIL_FROM;
    const from = process.env.EMAIL_FROM || to;

    if (!to) {
      return res
        .status(500)
        .json({ success: false, message: 'Feedback email configuration missing' });
    }

    await sendMail({
      from,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });

    return res.json({ success: true });
  } catch (error) {
    return handleControllerError(res, error, '[feedback] sendFeedback failed');
  }
};
