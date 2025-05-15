import path from 'path';
import inquirer from 'inquirer';
import { Collection } from '../models/Collection';
import { getCurrentCollectionId, setCurrentCollectionId } from '../utils/store';
import { generateMarkdownReport } from '../reports/markdown-report';
import { generateDocxReport } from '../reports/docx-report';
import { REPORTS_DIR, ensureReportsDir } from '../utils/fs-helpers';

// Create a new collection
export async function createCollection(): Promise<void> {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter collection name:',
        validate: (input) => input.trim().length > 0 ? true : 'Name cannot be empty'
      }
    ]);
    
    const collection = Collection.create(answers.name.trim());
    if (collection) {
      console.log(`Collection "${collection.name}" created with ID: ${collection.id}`);
      setCurrentCollectionId(collection.id);
    } else {
      console.error('Failed to create collection');
    }
  } catch (error) {
    console.error('Error creating collection:', error);
  }
}

// Delete a collection
export async function deleteCollection(): Promise<void> {
  try {
    const collections = Collection.getAll();
    
    if (collections.length === 0) {
      console.log('No collections found');
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Select collection to delete:',
        choices: collections.map(c => ({
          name: `${c.id}: ${c.name}`,
          value: c.id
        }))
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this collection? This will delete all associated tasks.',
        default: false
      }
    ]);
    
    if (!answers.confirm) {
      console.log('Operation cancelled');
      return;
    }
    
    const deleted = Collection.delete(answers.id);
    if (deleted) {
      console.log(`Collection deleted`);
      
      // Reset current collection if the deleted one was selected
      const currentId = getCurrentCollectionId();
      if (currentId === answers.id) {
        setCurrentCollectionId(null);
      }
    } else {
      console.error('Failed to delete collection');
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
  }
}

// List all collections
export function listCollections(): void {
  try {
    const collections = Collection.getAll();
    const currentId = getCurrentCollectionId();
    
    if (collections.length === 0) {
      console.log('No collections found');
      return;
    }
    
    console.log('\nCollections:');
    console.log('------------');
    collections.forEach(c => {
      const currentMarker = c.id === currentId ? '(current)' : '';
      console.log(`${c.id}: ${c.name} ${currentMarker}`);
    });
    console.log('');
  } catch (error) {
    console.error('Error listing collections:', error);
  }
}

// Choose a collection
export async function chooseCollection(): Promise<void> {
  try {
    const collections = Collection.getAll();
    
    if (collections.length === 0) {
      console.log('No collections found. Create a collection first.');
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'idOrName',
        message: 'Select a collection:',
        choices: [
          ...collections.map(c => ({
            name: `${c.id}: ${c.name}`,
            value: c.id.toString()
          })),
          {
            name: 'Enter collection name',
            value: 'name'
          }
        ]
      }
    ]);
    
    if (answers.idOrName === 'name') {
      // Get collection by name
      const nameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter collection name:',
          validate: (input) => input.trim().length > 0 ? true : 'Name cannot be empty'
        }
      ]);
      
      const collection = Collection.getByName(nameAnswer.name.trim());
      if (collection) {
        setCurrentCollectionId(collection.id);
        console.log(`Collection "${collection.name}" selected`);
      } else {
        console.log(`Collection "${nameAnswer.name}" not found`);
      }
    } else {
      // Get collection by ID
      const id = parseInt(answers.idOrName);
      const collection = Collection.getById(id);
      
      if (collection) {
        setCurrentCollectionId(collection.id);
        console.log(`Collection "${collection.name}" selected`);
      } else {
        console.log(`Collection with ID ${id} not found`);
      }
    }
  } catch (error) {
    console.error('Error choosing collection:', error);
  }
}

// Analyze collection and generate report
export async function analyzeCollection(): Promise<void> {
  try {
    const currentId = getCurrentCollectionId();
    
    if (currentId === null) {
      console.log('No collection selected. Choose a collection first.');
      return;
    }
    
    const collection = Collection.getById(currentId);
    
    if (!collection) {
      console.log(`Selected collection not found. Choose another collection.`);
      setCurrentCollectionId(null);
      return;
    }
    
    if (collection.completedTasks.length === 0) {
      console.log(`Collection "${collection.name}" has no completed tasks to analyze.`);
      return;
    }
    
    // Ask for output directory and format
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputDir',
        message: `Enter output directory (leave empty for default '${REPORTS_DIR}' directory):`,
        default: '.'
      },
      {
        type: 'list',
        name: 'format',
        message: 'Select output format:',
        choices: [
          { name: 'DOCX (default)', value: 'docx' },
          { name: 'Markdown', value: 'md' }
        ],
        default: 'docx'
      }
    ]);
    
    const outputDir = answers.outputDir === '.' ? 
      ensureReportsDir() : path.resolve(answers.outputDir);
    
    try {
      let reportPath: string;
      
      if (answers.format === 'md') {
        reportPath = await generateMarkdownReport(collection, outputDir);
      } else {
        reportPath = await generateDocxReport(collection, outputDir);
      }
      
      console.log(`Report generated successfully at: ${reportPath}`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  } catch (error) {
    console.error('Error analyzing collection:', error);
  }
} 