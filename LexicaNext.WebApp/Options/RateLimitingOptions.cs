namespace LexicaNext.WebApp.Options;

internal class RateLimitingOptions
{
    public const string Position = "RateLimiting";

    public int PermitLimit { get; init; } = 30;

    public TimeSpan WindowTime { get; init; } = TimeSpan.FromSeconds(60);
}
