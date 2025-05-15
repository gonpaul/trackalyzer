# Trackalyzer Usage Example

This directory contains a complete usage scenario for the Trackalyzer application, demonstrating how to track work on a web development project.

## Scenario: Web Application Development

In this example, a developer is working on a small e-commerce web application. They use Trackalyzer to track different tasks during the development process, including:

1. Setting up the project structure
2. Creating the database schema
3. Implementing user authentication
4. Building product catalog features
5. Creating the checkout process

## Files Included

- `scenario.sh` - A shell script demonstrating the CLI commands used
- `sample_output/` - Directory containing example output files:
  - `sample_collection.json` - Sample Collection data
  - `WebApp_Development_report.md` - Sample Markdown report
  - `WebApp_Development_report.docx` - Sample DOCX report
  - `docxExample.png` - a screenshot of a docx
  - `WebApp_Development_tasks_chart.png` - Sample chart image

## How to Run the Example

You can execute the scenario script to see how the commands would work:

```bash
# Make the script executable
chmod +x examples/scenario.sh

# Run the scenario script
./examples/scenario.sh
```

Note: Running the script will create real data in your Trackalyzer database. If you just want to see the example flow without affecting your data, review the script content without executing it.

## Expected Workflow

1. Create a collection for the web application project
2. Start a task for project setup
3. Stop the task and enter time spent
4. Start a new task for database schema
5. Link the task to a PR
6. Complete several more tasks
7. Generate an analysis report

This example demonstrates the full workflow from creating a collection to generating reports with time analysis. 
