using LexicaNext.Core;
using LexicaNext.Infrastructure.Db.Common.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace LexicaNext.Infrastructure.Db;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureDbServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddOptions(configuration).AddAppDbContext().AddDbHealthChecks();
    }

    private static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptionsType<ConnectionStringsOptions>(configuration, ConnectionStringsOptions.Position);
    }

    private static IServiceCollection AddAppDbContext(this IServiceCollection services)
    {
        return services.AddDbContext<AppDbContext>(
            (serviceProvider, options) =>
            {
                ConnectionStringsOptions connectionStrings =
                    serviceProvider.GetRequiredService<IOptions<ConnectionStringsOptions>>().Value;
                options.UseNpgsql(connectionStrings.AppPostgresDb);
            }
        );
    }

    private static IServiceCollection AddDbHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks().AddCheck<DbHealthCheck>(nameof(DbHealthCheck));

        return services;
    }
}
