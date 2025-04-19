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
        IConfigurationProvider? secretProvider = config.Providers.FirstOrDefault();
        string? postgresConnectionString = GetConnectionString(
            secretProvider,
            nameof(ConnectionStringsOptions.AppPostgresDb)
        );

        DbContextOptionsBuilder<AppDbContext> builder = new();
        builder.UseNpgsql(
            postgresConnectionString,
            x => x.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
        );

        return builder;
    }

    private string? GetConnectionString(IConfigurationProvider? secretProvider, string optionName)
    {
        if (secretProvider is null)
        {
            return null;
        }

        secretProvider.TryGet(
            $"{ConnectionStringsOptions.Position}:{optionName}",
            out string? connectionString
        );

        return connectionString;
    }
}
