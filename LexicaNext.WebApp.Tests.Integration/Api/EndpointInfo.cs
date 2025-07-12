namespace LexicaNext.WebApp.Tests.Integration.Api;

internal class EndpointInfo
{
    public string Path { get; init; } = "";

    public HttpMethod HttpMethod { get; init; } = HttpMethod.Get;
}
