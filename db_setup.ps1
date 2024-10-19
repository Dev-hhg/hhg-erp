# Windows PowerShell script (setup.ps1)
$env:DATABASE_URL = "postgresql://hhg_owner:complex%23password69@localhost:5433/hhg"

# Check if the volume exists
$volumeExists = docker volume ls -q -f name=hhg-postgres-data

if ($volumeExists -eq $null) {
    # Create a Docker volume for persistent data
    docker volume create hhg-postgres-data
}

# Build the Docker image
docker build -t hhg-postgres .


# Run the Docker container with the volume mounted
docker run -d --name hhg-postgres-container -p 5433:5432 -v hhg-postgres-data:/var/lib/postgresql/data hhg-postgres

echo "Container is running on port 5433 with the name hhg-postgres-container"

# check if the database is up and running


