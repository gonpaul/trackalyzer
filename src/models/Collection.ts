import { db } from '../db/database';
import { Task } from './Task';

export interface CollectionData {
  id: number;
  name: string;
  completedTasks?: Task[];
}

interface CollectionRow {
  id: number;
  name: string;
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

export class Collection implements CollectionData {
  id: number;
  name: string;
  completedTasks: Task[];

  constructor(data: { id: number; name: string; completedTasks?: Task[] }) {
    this.id = data.id;
    this.name = data.name;
    this.completedTasks = data.completedTasks || [];
  }

  static create(name: string): Collection | null {
    try {
      const stmt = db.prepare('INSERT INTO collections (name) VALUES (?)');
      const result = stmt.run(name);
      
      if (result.lastInsertRowid) {
        return new Collection({
          id: Number(result.lastInsertRowid),
          name: name,
          completedTasks: []
        });
      }
      return null;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  }

  static delete(id: number): boolean {
    try {
      const stmt = db.prepare('DELETE FROM collections WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }

  static getAll(): Collection[] {
    try {
      const stmt = db.prepare('SELECT * FROM collections');
      const collections = stmt.all() as CollectionRow[];
      return collections.map(c => new Collection({
        id: c.id,
        name: c.name
      }));
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  static getById(id: number): Collection | null {
    try {
      const stmt = db.prepare('SELECT * FROM collections WHERE id = ?');
      const collection = stmt.get(id) as CollectionRow | undefined;
      
      if (!collection) return null;

      const tasks = db.prepare(`
        SELECT * FROM tasks 
        WHERE collection_id = ? AND finish_time IS NOT NULL
      `).all(id) as TaskRow[];

      const mappedTasks = tasks.map(t => new Task({
        id: t.id,
        name: t.name,
        description: t.description,
        pullRequest: t.pull_request,
        startTime: new Date(t.start_time),
        finishTime: t.finish_time ? new Date(t.finish_time) : undefined,
        collectionId: t.collection_id
      }));

      return new Collection({
        id: collection.id,
        name: collection.name,
        completedTasks: mappedTasks
      });
    } catch (error) {
      console.error('Error fetching collection by ID:', error);
      return null;
    }
  }

  static getByName(name: string): Collection | null {
    try {
      const stmt = db.prepare('SELECT * FROM collections WHERE name = ?');
      const collection = stmt.get(name) as CollectionRow | undefined;
      
      if (!collection) return null;

      return Collection.getById(collection.id);
    } catch (error) {
      console.error('Error fetching collection by name:', error);
      return null;
    }
  }
} 