import express from 'express';

import {
  createPlanningTask,
  deletePlanningTask,
  getPlanningTaskById,
  updatePlanningTask,
  // 批次
  getAllPlanningTasks,
  getPlanningTasksByProjectId,
  createPlanningTasks,
  replacePlanningTasksByProjectId,
  deletePlanningTaskByProjectId,
} from '@/controllers/planningTasks';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/:projectId', requireUserId, createPlanningTask);
router.get('/detail/:id', requireUserId, getPlanningTaskById);
router.patch('/detail/:id', requireUserId, updatePlanningTask);
router.delete('/:id', requireUserId, deletePlanningTask);
// 批次規劃任務操作
router.get('/', requireUserId, getAllPlanningTasks);
router.get('/:projectId', requireUserId, getPlanningTasksByProjectId);
router.post('/:projectId/batch', requireUserId, createPlanningTasks);
router.put('/:projectId/replace', requireUserId, replacePlanningTasksByProjectId);
router.delete('/:projectId', requireUserId, deletePlanningTaskByProjectId);

export default router;
