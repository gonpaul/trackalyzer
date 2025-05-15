import inquirer from 'inquirer';
import { Task } from '../models/Task';
import { Collection } from '../models/Collection';
import { getCurrentCollectionId } from '../utils/store';

// Start a new task
export async function startTask(): Promise<void> {
  try {
    const currentId = getCurrentCollectionId();
    
    if (currentId === null) {
      console.log('No collection selected. Choose a collection first.');
      return;
    }
    
    // Check if there is already a task in progress
    const currentTask = Task.getCurrentTask(currentId);
    if (currentTask) {
      console.log(`There is already a task in progress: "${currentTask.name}" (ID: ${currentTask.id})`);
      console.log('Stop the current task before starting a new one.');
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter task name:',
        validate: (input) => input.trim().length > 0 ? true : 'Task name cannot be empty'
      }
    ]);
    
    const task = Task.start(currentId, answers.name.trim());
    
    if (task) {
      console.log(`Task "${task.name}" started at ${task.startTime.toLocaleString()}`);
    } else {
      console.error('Failed to start task');
    }
  } catch (error) {
    console.error('Error starting task:', error);
  }
}

// Stop the current task
export async function stopTask(): Promise<void> {
  try {
    const currentId = getCurrentCollectionId();
    
    if (currentId === null) {
      console.log('No collection selected. Choose a collection first.');
      return;
    }
    
    // Get current task
    const currentTask = Task.getCurrentTask(currentId);
    
    if (!currentTask) {
      console.log('No task in progress. Start a task first.');
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Enter task description:',
        validate: (input) => input.trim().length > 0 ? true : 'Description cannot be empty'
      },
      {
        type: 'input',
        name: 'pullRequest',
        message: 'Enter pull request (leave empty for none):',
      }
    ]);
    
    const success = Task.stop(
      currentTask.id, 
      answers.description.trim(), 
      answers.pullRequest.trim() || null
    );
    
    if (success) {
      const completedTask = Task.getById(currentTask.id);
      if (completedTask && completedTask.finishTime) {
        console.log(`Task "${completedTask.name}" completed at ${completedTask.finishTime.toLocaleString()}`);
        console.log(`Time spent: ${completedTask.hoursSpent} hours`);
      } else {
        console.log('Task completed successfully');
      }
    } else {
      console.error('Failed to stop task');
    }
  } catch (error) {
    console.error('Error stopping task:', error);
  }
}

// Delete a task
export async function deleteTask(): Promise<void> {
  try {
    const currentId = getCurrentCollectionId();
    
    if (currentId === null) {
      console.log('No collection selected. Choose a collection first.');
      return;
    }
    
    // Get the collection to see all tasks
    const collection = Collection.getById(currentId);
    
    if (!collection) {
      console.log('Selected collection not found.');
      return;
    }
    
    // Get current task in progress
    const currentTask = Task.getCurrentTask(currentId);
    
    // Combine completed tasks with current task if it exists
    const allTasks = [...collection.completedTasks];
    if (currentTask) {
      allTasks.unshift(currentTask);
    }
    
    if (allTasks.length === 0) {
      console.log('No tasks found in this collection.');
      return;
    }
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Select task to delete:',
        choices: allTasks.map(t => {
          const status = t.finishTime ? 'Completed' : 'In Progress';
          return {
            name: `${t.id}: ${t.name} (${status})`,
            value: t.id
          };
        })
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this task?',
        default: false
      }
    ]);
    
    if (!answers.confirm) {
      console.log('Operation cancelled');
      return;
    }
    
    const deleted = Task.delete(answers.id);
    
    if (deleted) {
      console.log('Task deleted successfully');
    } else {
      console.error('Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
} 