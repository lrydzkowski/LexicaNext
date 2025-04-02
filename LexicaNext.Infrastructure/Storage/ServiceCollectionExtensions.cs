using LexicaNext.Core;
using LexicaNext.Infrastructure.Storage.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Infrastructure.Storage;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureStorageServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddOptions(configuration);
    }

    private static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptionsType<StorageOptions>(configuration, StorageOptions.Position);
    }
}
