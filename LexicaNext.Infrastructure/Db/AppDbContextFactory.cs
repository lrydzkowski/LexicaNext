using LexicaNext.Infrastructure.Db.Common.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace LexicaNext.Infrastructure.Db;

internal class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<AppDbContext> builder = GetDbContextOptionsBuilder();

        return new AppDbContext(builder.Options);
    }

    private DbContextOptionsBuilder<AppDbContext> GetDbContextOptionsBuilder()
    {
        IConfigurationRoot config = new ConfigurationBuilder()
            .AddUserSecrets<AppDbContext>()
            .AddEnvironmentVariables()
            .Build();
        string? postgresConnectionString = config.GetConnectionString(nameof(ConnectionStringsOptions.AppPostgresDb));

        DbContextOptionsBuilder<AppDbContext> builder = new();
        builder.UseNpgsql(
            postgresConnectionString,
            x => x.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
        );

        return builder;
    }
}
