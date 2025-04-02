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
        IConfigurationRoot config = new ConfigurationBuilder().AddUserSecrets<AppDbContext>().Build();
        IConfigurationProvider secretProvider = config.Providers.First();
        DbContextOptionsBuilder<AppDbContext> builder = new();

        string? postgresConnectionString = GetConnectionString(
            secretProvider,
            nameof(ConnectionStringsOptions.AppPostgresDb)
        );
        if (!IsConnectionStringCorrect(postgresConnectionString))
        {
            throw new Exception("There is no connection string in user secrets.");
        }

        builder.UseNpgsql(
            postgresConnectionString,
            x => x.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
        );

        return builder;
    }

    private string? GetConnectionString(IConfigurationProvider secretProvider, string optionName)
    {
        secretProvider.TryGet(
            $"{ConnectionStringsOptions.Position}:{optionName}",
            out string? connectionString
        );

        return connectionString;
    }

    private bool IsConnectionStringCorrect(string? connectionString)
    {
        return !string.IsNullOrWhiteSpace(connectionString);
    }
}
