using LexicaNext.Core;
using LexicaNext.Infrastructure.EnglishDictionary.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Infrastructure.EnglishDictionary;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureEnglishDictionaryServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        return services.AddOptions(configuration).AddEnglishDictionaryHttpClient().AddHealthChecks();
    }

    private static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptionsType<EnglishDictionaryOptions>(configuration, EnglishDictionaryOptions.Position);
    }

    private static IServiceCollection AddHealthChecks(this IServiceCollection services)
    {
        HealthCheckServiceCollectionExtensions.AddHealthChecks(services)
            .AddCheck<EnglishDictionaryHealthCheck>(nameof(EnglishDictionaryHealthCheck));

        return services;
    }
}
