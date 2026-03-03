import express from 'express';

import {
  batchCreateMaterials,
  batchDeleteMaterials,
  batchUpdateMaterials,
  createMaterial,
  deleteMaterial,
  getAllMaterials,
  getMaterialById,
  getMaterialsByProjectId,
  getMaterialsByTaskId,
  updateMaterial,
} from '@/controllers/materials';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

// Protect all material-related routes and ensure user is authenticated
router.use(authMiddleware, requireUserId);

// Get all materials for current user
router.get('/', getAllMaterials);

// Get materials for a project or a task
router.get('/project/:projectId', getMaterialsByProjectId);
router.get('/task/:taskId', getMaterialsByTaskId);

// Batch operations
router.post('/batch', batchCreateMaterials);
router.patch('/batch', batchUpdateMaterials);
router.delete('/batch', batchDeleteMaterials);

// Single material operations
router.post('/', createMaterial);
router.get('/:id', getMaterialById);
router.patch('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

export default router;
