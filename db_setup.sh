# Linux Bash script (setup.sh)
#!/bin/bash
export DATABASE_URL="postgresql://hhg_owner:complex%23password69@localhost:5433/hhg"

# Check if the volume exists
if [ -z "$(docker volume ls -q -f name=hhg-postgres-data)" ]; then
    # Create a Docker volume for persistent data
    docker volume create hhg-postgres-data
fi

# Build the Docker image
docker build -t hhg-postgres .

# Run the Docker container with the volume mounted
docker run -d --name hhg-postgres-container -p 5433:5432 -v hhg-postgres-data:/var/lib/postgresql/data hhg-postgres
