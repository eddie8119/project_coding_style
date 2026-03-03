import { Router } from 'express';

import {
  batchUpsertPlanningMaterials,
  deletePlanningMaterial,
  getAllPlanningMaterials,
  getPlanningMaterials,
  upsertPlanningMaterial,
} from '@/controllers/planningMaterial';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', requireUserId, getAllPlanningMaterials);
router.get('/project/:projectId', requireUserId, getPlanningMaterials);
router.post('/upsert', requireUserId, upsertPlanningMaterial);
router.post('/batch-upsert', requireUserId, batchUpsertPlanningMaterials);
router.delete('/:id', requireUserId, deletePlanningMaterial);

export default router;
