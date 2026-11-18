# SAP B1 SQL Studio — real T-SQL prototype

The container defaults to SQL Server 2022 Express. Set MSSQL_PID=Developer only for development and testing. Express is free for production within edition limits, but this prototype is not safe for public access. Docker host must support the SQL Server image and have sufficient memory. Set MSSQL_SA_PASSWORD in your local environment (never commit it), then run `docker compose up -d` from this directory. Connect with SSMS to localhost,1433 using local credentials and run seed.sql. The seed is synthetic and contains one sample table and a real stored procedure.

Do not expose port 1433 publicly or give website visitors administrator credentials. A public deployment requires a properly licensed database service, authenticated isolated per-user databases, resource limits, query timeouts, cleanup and a separate API. GitHub Pages cannot run this container. No cloud service has been provisioned.
