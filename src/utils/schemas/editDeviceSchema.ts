import { z } from 'zod';

export const editDeviceSchema = z.object({
  ID: z.string(),
  location: z.string(),
  product_name: z.string(),
  main_unit: z.string(),
  group: z.string().min(1, 'Group is required'),
  tag: z.string().min(1, 'Tag is required'),
  low_bound: z.number().refine((val) => val !== null, 'Low Bound is required'),
  low_alarm: z.number().refine((val) => val !== null, 'Low Alarm is required'),
  high_alarm: z.number().refine((val) => val !== null, 'High Alarm is required'),
  high_bound: z.number().refine((val) => val !== null, 'High Bound is required'),
});

export type EditDeviceSchema = z.infer<typeof editDeviceSchema>;
