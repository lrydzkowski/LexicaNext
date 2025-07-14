using Microsoft.Net.Http.Headers;

namespace LexicaNext.Core.Common.Infrastructure.Models;

public static class HttpHeaderNames
{
    public const string OcpApimSubscriptionKey = "Ocp-Apim-Subscription-Key";

    public const string Access = "Access";

    public const string ApiKey = "X-Api-Key";

    public static readonly IReadOnlyList<string> HeadersToFilterFromLogs =
    [
        HeaderNames.Authorization, OcpApimSubscriptionKey, Access, ApiKey
    ];
}
