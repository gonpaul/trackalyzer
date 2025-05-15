### Требования
Консольное приложение для трекинга и анализа работы на производственной практике с локальной бд.
Использовать typescript, sqlite and a data representation lib.
Отчёт форматировать либо в .docx, либо в .md по опции (дефолт .docx)

Основные комманды:
для trackalyzer (tracker + analyzer)
- collection create
    - waits for input to get a collection name
- collection delete
    - result message
- collection list
    - table-formatted collections
- collection choose
    - can be chosen either by id or name
- collection analyze
    - generates a new .md or .docx file in the specified location.
      by default generates in the current directory

tasks
- task start
    - prompts for task name
- task stop
	- after stopping should asks for (pullRequest: can be null, description: String required) 
- task delete 


```sql schemas
collections {
	id: AUTOINCREMENT,
	name: STRING REQUIRED,
}

tasks {
	id: AUTOINCREMENT,
	collection_id: INTEGER NOT NULL,
    name: String Required,
	description: String Required, 
	startTime: TIMESTAMP DEFAULT CURRENT_TIME,
	finishTime: TIMESTAMP REQUIRED NOT NULL
}
```

```typescript
collections: [
	{
		id: Integer required,
		name: String required,
		completedTasks: Array<Task>
	},
]

task: {
	id: Integer required,
    name: String,
	pullRequest: String | null,
	description: String,
	hoursSpent: float, // finish - start
}

analysis: {
	tasksDone: completedTasks.length,
	pullRequests: countPR(),
	hoursSpent: countTotalHoursSpent(),
	averageTimePerTask: countAverageTime(), // using mode
}
```

### Формат
Таблица completedTasks в файле с форматами .md или .docx

Анализ в формате текстовых данных и одной стобчатой диаграммы
как для .md, так и для .docx

Пример
```
taskDone: 10,
pullRequests: 7,
hoursSpent: 40,
averageTimePerTask: 5.4

Vertical diagram with task ids on x axis and time on y axis
```
