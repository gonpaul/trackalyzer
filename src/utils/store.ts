import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'data', 'store.json');

interface Store {
  currentCollectionId: number | null;
}

let storeData: Store = {
  currentCollectionId: null
};

// Initialize store
export function initStore(): void {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      storeData = JSON.parse(data);
    } else {
      // Ensure directory exists
      const storeDir = path.dirname(STORE_FILE);
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true });
      }
      
      // Create default store
      saveStore();
    }
  } catch (error) {
    console.error('Error initializing store:', error);
    // Create default store on error
    saveStore();
  }
}

// Get current collection ID
export function getCurrentCollectionId(): number | null {
  return storeData.currentCollectionId;
}

// Set current collection ID
export function setCurrentCollectionId(id: number | null): void {
  storeData.currentCollectionId = id;
  saveStore();
}

// Save store to file
function saveStore(): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeData, null, 2));
  } catch (error) {
    console.error('Error saving store:', error);
  }
} 