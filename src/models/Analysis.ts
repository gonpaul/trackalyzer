import { Collection } from './Collection';
import { Task } from './Task';

export interface AnalysisData {
  tasksDone: number;
  pullRequests: number;
  hoursSpent: number;
  averageTimePerTask: number;
  tasks: Task[];
}

export class Analysis implements AnalysisData {
  tasksDone: number;
  pullRequests: number;
  hoursSpent: number;
  averageTimePerTask: number;
  tasks: Task[];

  constructor(collection: Collection) {
    this.tasks = collection.completedTasks;
    this.tasksDone = this.tasks.length;
    this.pullRequests = this.countPullRequests();
    this.hoursSpent = this.calculateTotalHours();
    this.averageTimePerTask = this.calculateAverageTime();
  }

  private countPullRequests(): number {
    return this.tasks.filter(task => task.pullRequest !== null).length;
  }

  private calculateTotalHours(): number {
    return parseFloat(
      this.tasks
        .reduce((total, task) => total + task.hoursSpent, 0)
        .toFixed(2)
    );
  }

  private calculateAverageTime(): number {
    if (this.tasksDone === 0) return 0;
    
    return parseFloat(
      (this.hoursSpent / this.tasksDone).toFixed(2)
    );
  }

  getTasksChartData() {
    return this.tasks.map(task => ({
      id: task.id,
      name: task.name,
      hoursSpent: task.hoursSpent
    }));
  }
} 