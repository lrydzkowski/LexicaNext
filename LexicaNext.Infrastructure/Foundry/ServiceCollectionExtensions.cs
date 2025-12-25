using LexicaNext.Core;
using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Infrastructure.Foundry;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFoundryServices(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptions(configuration).AddServices();
    }

    private static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddOptionsType<FoundryOptions>(configuration, FoundryOptions.Position);
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        return services.AddScoped<IAiGenerationService, AzureFoundryAiService>();
    }
}
