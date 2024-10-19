# Use the official PostgreSQL image
FROM postgres:16

# Set environment variables
ENV POSTGRES_DB=hhg
ENV POSTGRES_USER=hhg_owner
ENV POSTGRES_PASSWORD=complex%23password69

# Copy the SQL script into the container
COPY init.sql /docker-entrypoint-initdb.d/

# Execute the SQL script
RUN chmod 755 /docker-entrypoint-initdb.d/init.sql

# Expose the PostgreSQL port
EXPOSE 5432
