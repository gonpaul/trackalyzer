#!/usr/bin/env node

import { Command } from 'commander';
import { initializeDatabase } from './db/database';
import { initStore } from './utils/store';
import { 
  createCollection, 
  deleteCollection, 
  listCollections, 
  chooseCollection,
  analyzeCollection
} from './commands/collection-commands';
import {
  startTask,
  stopTask,
  deleteTask
} from './commands/task-commands';

// Initialize
initializeDatabase();
initStore();

const program = new Command();

program
  .name('trackalyzer')
  .description('CLI application for tracking and analyzing work')
  .version('1.0.0');

// Collection commands
const collectionCommand = program.command('collection')
  .description('Manage collections');

collectionCommand
  .command('create')
  .description('Create a new collection')
  .action(createCollection);

collectionCommand
  .command('delete')
  .description('Delete a collection')
  .action(deleteCollection);

collectionCommand
  .command('list')
  .description('List all collections')
  .action(listCollections);

collectionCommand
  .command('choose')
  .description('Choose an active collection')
  .action(chooseCollection);

collectionCommand
  .command('analyze')
  .description('Analyze the current collection and generate a report')
  .action(analyzeCollection);

// Task commands
const taskCommand = program.command('task')
  .description('Manage tasks');

taskCommand
  .command('start')
  .description('Start a new task')
  .action(startTask);

taskCommand
  .command('stop')
  .description('Stop the current task')
  .action(stopTask);

taskCommand
  .command('delete')
  .description('Delete a task')
  .action(deleteTask);

program.parse(process.argv); 