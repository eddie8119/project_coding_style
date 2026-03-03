import { Router } from 'express';

import {
  batchUpdateMaterialDefinitions,
  createMaterialDefinition,
  deleteMaterialDefinition,
  getMaterialDefinitions,
  updateMaterialDefinition,
} from '@/controllers/materialDefinition';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', requireUserId, getMaterialDefinitions);
router.post('/', requireUserId, createMaterialDefinition);
router.patch('/batch', requireUserId, batchUpdateMaterialDefinitions);
router.patch('/:id', requireUserId, updateMaterialDefinition);
router.delete('/:id', requireUserId, deleteMaterialDefinition);

export default router;
