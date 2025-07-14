namespace LexicaNext.Infrastructure.Auth.Options;

internal class ApiKeyOptions
{
    public const string Position = "ApiKey";

    public string[] ValidKeys { get; init; } = [];
}
