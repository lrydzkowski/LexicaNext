using LexicaNext.Core;
using LexicaNext.Core.Features.Sentences.GenerateExampleSentences.Interfaces;
using LexicaNext.Core.Features.Translations.GenerateTranslations.Interfaces;
using LexicaNext.Core.Features.Words.GenerateWords.Interfaces;
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
        return services.AddScoped<AzureFoundryAiService>()
            .AddScoped<IWordGenerationService>(provider => provider.GetRequiredService<AzureFoundryAiService>())
            .AddScoped<ITranslationGenerationService>(provider => provider.GetRequiredService<AzureFoundryAiService>())
            .AddScoped<IExampleSentenceGenerationService>(provider => provider.GetRequiredService<AzureFoundryAiService>());
    }
}
