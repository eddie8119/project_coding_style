import express from 'express';

import authRoutes from './auth';
import billingRoutes from './billing';
import collaboratorRoutes from './collaborator';
import commonRoutes from './common';
import draftRoutes from './draft';
import feedbackRoutes from './feedback';
import invitationRoutes from './invitation';
import materialDefinitionRoutes from './materialDefinition';
import materialsRoutes from './materials';
import notificationRoutes from './notification';
import planningMaterialRoutes from './planningMaterial';
import planningTasksRoutes from './planningTasks';
import taskRoutes from './task';
import userRoutes from './user';
import userSettingsRoutes from './user-settings';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/planning-tasks', planningTasksRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/collaborators', collaboratorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/material-definitions', materialDefinitionRoutes);
app.use('/api/planning-materials', planningMaterialRoutes);

export default app;
