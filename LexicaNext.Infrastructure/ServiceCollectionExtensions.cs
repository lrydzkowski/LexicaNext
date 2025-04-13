using LexicaNext.Infrastructure.Auth0;
using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.EnglishDictionary;
using LexicaNext.Infrastructure.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddInfrastructureAuth0Services(configuration)
            .AddInfrastructureDbServices(configuration)
            .AddInfrastructureEnglishDictionaryServices(configuration)
            .AddInfrastructureStorageServices(configuration);
    }
}
