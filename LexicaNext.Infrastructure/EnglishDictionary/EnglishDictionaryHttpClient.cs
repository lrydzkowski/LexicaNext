using LexicaNext.Infrastructure.EnglishDictionary.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace LexicaNext.Infrastructure.EnglishDictionary;

internal static class EnglishDictionaryHttpClient
{
    public static IServiceCollection AddEnglishDictionaryHttpClient(this IServiceCollection services)
    {
        services.AddHttpClient(
            nameof(EnglishDictionaryHttpClient),
            (serviceProvider, client) =>
            {
                IOptions<EnglishDictionaryOptions> options =
                    serviceProvider.GetRequiredService<IOptions<EnglishDictionaryOptions>>();
                client.BaseAddress = new Uri(options.Value.BaseUrl);
            }
        );

        return services;
    }
}
