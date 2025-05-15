import fs from 'fs';
import path from 'path';

// Define the reports output directory name
export const REPORTS_DIR = 'reports';

/**
 * Ensures the reports directory exists
 * @returns The absolute path to the reports directory
 */
export function ensureReportsDir(): string {
  const reportsDir = path.join(process.cwd(), REPORTS_DIR);
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  return reportsDir;
}

/**
 * Gets the path for a collection's report directory
 * @param collectionName Name of the collection
 * @returns Path to the collection's report directory
 */
export function getCollectionReportDir(collectionName: string): string {
  const reportsDir = ensureReportsDir();
  const safeCollectionName = collectionName.replace(/\s+/g, '_');
  const collectionDir = path.join(reportsDir, safeCollectionName);
  
  if (!fs.existsSync(collectionDir)) {
    fs.mkdirSync(collectionDir, { recursive: true });
  }
  
  return collectionDir;
} 