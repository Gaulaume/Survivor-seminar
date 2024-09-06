# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the required Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

# Define the entrypoint script to run the application

ENTRYPOINT ["./entrypoint.sh"]
