import { z } from 'zod';

export const editDeviceAlarmSchema = z.object({
  ID_categories: z.string(),
  alarm_type: z.enum(['upper', 'lower']).optional(),
  active: z.boolean().optional(),
  interval: z.number(),
  severity: z.enum(['notice', 'caution', 'warning']),
  threshold: z.number(),
  repeat: z.number(),
  email: z.array(z.string().email()).optional(),
});

export type EditDeviceAlarmSchema = z.infer<typeof editDeviceAlarmSchema>;
