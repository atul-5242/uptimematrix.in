# Cron Service

This service handles automated cleanup of old website ticks to prevent database bloat.

## Features

- **Daily Cleanup**: Runs every day at 00:30 (12:30 AM) IST
- **Region-Specific**: Only deletes ticks from the specified region
- **Data Retention**: Keeps only current and previous day data (deletes ticks older than 2 days)
- **Logging**: Provides detailed logs of cleanup operations

## Environment Variables

- `REGION`: The region this cron service is responsible for (e.g., "India")
- `DATABASE_URL`: Database connection string

## How it Works

1. Runs daily at 00:30 AM IST
2. Calculates date 2 days ago
3. Deletes all website ticks older than 2 days for the specified region
4. Logs cleanup statistics

## Example

If today is Day 3:
- Keeps: Day 2 and Day 3 ticks
- Deletes: Day 1 and older ticks

This ensures the database only stores recent monitoring data while maintaining performance.
