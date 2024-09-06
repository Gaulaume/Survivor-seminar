#!/bin/sh
# entrypoint.sh

# Run the data fetcher script
python -m data_fetcher

# Start the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload