using LexicaNext.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Infrastructure.Foundry;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFoundryServices(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptions();
    }

    private static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptionsType<FoundryOptions>(configuration, FoundryOptions.Position);
    }
}
