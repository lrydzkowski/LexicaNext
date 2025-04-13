using System.Net;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Infrastructure.Services;

namespace LexicaNext.Core.Common.Infrastructure.Extensions;

public static class HttpMessageExtensions
{
    public static void CreateContent<T>(this HttpRequestMessage request, T payload)
    {
        string serializedPayload = JsonSerializer.Serialize(payload, Serializer.Options);
        request.Content = new StringContent(
            serializedPayload,
            Encoding.UTF8,
            new MediaTypeHeaderValue(MediaTypeNames.Application.Json)
        );
    }

    public static async Task<T?> GetResponseAsync<T>(this HttpResponseMessage response)
    {
        string message = await response.GetResponseMessageAsync();
        T? payload = JsonSerializer.Deserialize<T>(message, Serializer.Options);

        return payload;
    }

    public static async Task<string> GetResponseMessageAsync(this HttpResponseMessage response)
    {
        return await response.Content.ReadAsStringAsync();
    }

    public static async Task ThrowIfNotSuccessAsync(
        this HttpResponseMessage response,
        HttpStatusCode expectedHttpStatusCode = HttpStatusCode.OK
    )
    {
        await response.ThrowIfNotSuccessAsync([expectedHttpStatusCode]);
    }

    public static async Task ThrowIfNotSuccessAsync(
        this HttpResponseMessage response,
        IReadOnlyList<HttpStatusCode> expectedHttpStatusCodes
    )
    {
        if (expectedHttpStatusCodes.Contains(response.StatusCode))
        {
            return;
        }

        string errorMessage = await response.BuildUnrecognizedResponseErrorMessageAsync();
        throw new HttpRequestException(errorMessage);
    }

    private static async Task<string> BuildUnrecognizedResponseErrorMessageAsync(this HttpResponseMessage response)
    {
        HttpRequestMessage? request = response.RequestMessage;
        string requestPayload = request?.Content is null ? "" : await request.Content.ReadAsStringAsync();
        string responsePayload = await response.Content.ReadAsStringAsync();

        StringBuilder errorMessageBuilder = new();
        errorMessageBuilder.AppendLine($"Unrecognized response from {request?.Method} {request?.RequestUri}.");
        errorMessageBuilder.AppendLine($"Request payload: '{requestPayload}'.");
        errorMessageBuilder.AppendLine($"Response status: {response.StatusCode}.");
        errorMessageBuilder.AppendLine($"Response payload: '{responsePayload}'.");
        if (request?.Headers is not null)
        {
            errorMessageBuilder.AppendLine("Request headers:");
            foreach (KeyValuePair<string, IEnumerable<string>> header in request.Headers)
            {
                string headerName = header.Key;
                if (HttpHeaderNames.HeadersToFilterFromLogs.ContainsIgnoreCase(headerName))
                {
                    continue;
                }

                errorMessageBuilder.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
            }
        }

        string errorMessage = errorMessageBuilder.ToString();

        return errorMessage;
    }
}
