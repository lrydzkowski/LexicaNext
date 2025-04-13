# LexicaNext

The next iteration of Lexica, an English vocabulary learning software:

- <https://github.com/lrydzkowski/R.Systems.Lexica>
- <https://github.com/lrydzkowski/R.Systems.ReactFront>

**Project is under construction**

Open API Specification: <https://localhost:7226/openapi/v1.json>

Create EF Core migration:

```powershell
cd .\LexicaNext.Infrastructure
dotnet ef migrations add <migration_name> -o Db\Migrations
```

Apply EF Core migration:

```powershell
cd .\LexicaNext.Infrastructure
dotnet ef database update
```

Docker compose:

```powershell
docker compose -f ./compose.yaml -p lexica-next up --build
```
