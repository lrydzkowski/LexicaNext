using System.Net;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Infrastructure.EnglishDictionary.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LexicaNext.Infrastructure.EnglishDictionary.Services;

internal interface IApiClient
{
    Task<string?> GetPageAsync(string word, CancellationToken cancellationToken = default);

    Task<byte[]?> DownloadFileAsync(string relativePath, CancellationToken cancellationToken = default);
}

internal class ApiClient : IScopedService, IApiClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ApiClient> _logger;
    private readonly EnglishDictionaryOptions _options;

    public ApiClient(
        IOptions<EnglishDictionaryOptions> options,
        ILogger<ApiClient> logger,
        IHttpClientFactory httpClientFactory
    )
    {
        _options = options.Value;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string?> GetPageAsync(string word, CancellationToken cancellationToken = default)
    {
        HttpClient client = _httpClientFactory.CreateClient(nameof(EnglishDictionaryHttpClient));

        string requestPath = _options.Path.Replace(Constants.WordPlaceholder, word);
        using HttpRequestMessage requestMessage = new(HttpMethod.Get, requestPath);

        using HttpResponseMessage responseMessage = await client.SendAsync(requestMessage, cancellationToken);
        if (responseMessage.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("'{Url}' returns not found", responseMessage.RequestMessage?.RequestUri?.AbsolutePath);

            return null;
        }

        await responseMessage.ThrowIfNotSuccessAsync();
        if (WasRedirected(requestPath, responseMessage))
        {
            _logger.LogWarning(
                "Request to '{RequestPath}' was redirected to '{RedirectedPath}'",
                requestPath,
                responseMessage.RequestMessage?.RequestUri?.AbsolutePath
            );

            return null;
        }

        return await responseMessage.GetResponseMessageAsync();
    }

    public async Task<byte[]?> DownloadFileAsync(string relativePath, CancellationToken cancellationToken = default)
    {
        HttpClient client = _httpClientFactory.CreateClient(nameof(EnglishDictionaryHttpClient));

        using HttpRequestMessage requestMessage = new(HttpMethod.Get, relativePath);

        using HttpResponseMessage responseMessage = await client.SendAsync(requestMessage, cancellationToken);
        await responseMessage.ThrowIfNotSuccessAsync();

        return await responseMessage.Content.ReadAsByteArrayAsync(cancellationToken);
    }

    private bool WasRedirected(string requestPath, HttpResponseMessage response)
    {
        return response.RequestMessage?.RequestUri is not null
               && response.RequestMessage.RequestUri.AbsolutePath != requestPath;
    }
}
