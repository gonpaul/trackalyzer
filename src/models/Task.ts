import { db } from '../db/database';

export interface TaskData {
  id: number;
  name: string;
  pullRequest?: string | null;
  description: string;
  startTime: Date;
  finishTime?: Date;
  collectionId?: number;
}

interface TaskRow {
  id: number;
  collection_id: number;
  name: string;
  description: string;
  pull_request: string | null;
  start_time: string;
  finish_time: string | null;
}

export class Task implements TaskData {
  id: number;
  name: string;
  pullRequest: string | null;
  description: string;
  startTime: Date;
  finishTime?: Date;
  collectionId?: number;

  constructor(data: TaskData) {
    this.id = data.id;
    this.name = data.name;
    this.pullRequest = data.pullRequest || null;
    this.description = data.description;
    this.startTime = data.startTime;
    this.finishTime = data.finishTime;
    this.collectionId = data.collectionId;
  }

  get hoursSpent(): number {
    if (!this.finishTime) return 0;
    
    const durationMs = this.finishTime.getTime() - this.startTime.getTime();
    return parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
  }

  static start(collectionId: number, name: string): Task | null {
    try {
      const stmt = db.prepare(`
        INSERT INTO tasks (collection_id, name, description) 
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(collectionId, name, '');
      
      if (result.lastInsertRowid) {
        return new Task({
          id: Number(result.lastInsertRowid),
          name,
          description: '',
          startTime: new Date(),
          collectionId
        });
      }
      return null;
    } catch (error) {
      console.error('Error starting task:', error);
      return null;
    }
  }

  static stop(id: number, description: string, pullRequest?: string): boolean {
    try {
      const stmt = db.prepare(`
        UPDATE tasks 
        SET description = ?, pull_request = ?, finish_time = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      const result = stmt.run(description, pullRequest || null, id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error stopping task:', error);
      return false;
    }
  }

  static delete(id: number): boolean {
    try {
      const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  static getById(id: number): Task | null {
    try {
      const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
      const task = stmt.get(id) as TaskRow | undefined;
      
      if (!task) return null;

      return new Task({
        id: task.id,
        name: task.name,
        description: task.description,
        pullRequest: task.pull_request,
        startTime: new Date(task.start_time),
        finishTime: task.finish_time ? new Date(task.finish_time) : undefined,
        collectionId: task.collection_id
      });
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      return null;
    }
  }

  static getCurrentTask(collectionId: number): Task | null {
    try {
      const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE collection_id = ? AND finish_time IS NULL
        ORDER BY start_time DESC LIMIT 1
      `);
      const task = stmt.get(collectionId) as TaskRow | undefined;
      
      if (!task) return null;

      return new Task({
        id: task.id,
        name: task.name,
        description: task.description,
        pullRequest: task.pull_request,
        startTime: new Date(task.start_time),
        finishTime: task.finish_time ? new Date(task.finish_time) : undefined,
        collectionId: task.collection_id
      });
    } catch (error) {
      console.error('Error fetching current task:', error);
      return null;
    }
  }
} 