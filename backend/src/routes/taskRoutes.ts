import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = Router();


router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskCompletion);
router.delete('/:id', deleteTask);

export default router;
