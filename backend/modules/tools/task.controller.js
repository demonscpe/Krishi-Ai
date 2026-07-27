/**
 * Task Controller
 * Handles CRUD operations for farmer task reminders.
 * Uses Firestore as the data store.
 */
const admin = require('../../config/firebase');

const TASKS_COL = 'tasks';

const snapToObj = (snap) => ({ id: snap.id, ...snap.data() });

/**
 * GET /api/tasks — Get all tasks for the authenticated user
 */
exports.getTasks = async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection(TASKS_COL)
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const tasks = snapshot.docs.map(snapToObj);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * POST /api/tasks — Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = {
      userId: req.user.uid,
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'medium', // low, medium, high
      category: category || 'general', // general, planting, watering, harvesting, fertilizing
      completed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore().collection(TASKS_COL).add(task);
    const newTask = await docRef.get();
    
    res.status(201).json(snapToObj(newTask));
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * PUT /api/tasks/:id — Update a task
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, category, completed } = req.body;

    const docRef = admin.firestore().collection(TASKS_COL).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (completed !== undefined) updates.completed = completed;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    
    res.json(snapToObj(updatedDoc));
  } catch (error) {
    console.error('Error updating task:', error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE /api/tasks/:id — Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = admin.firestore().collection(TASKS_COL).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await docRef.delete();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(400).json({ message: error.message });
  }
};

