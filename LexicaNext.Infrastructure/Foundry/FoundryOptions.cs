namespace LexicaNext.Infrastructure.Foundry;

internal class FoundryOptions
{
    public const string Position = "Foundry";

    public string ProjectEndpoint { get; init; } = "";

    public string ModelDeploymentName { get; init; } = "";

    public string TenantId { get; init; } = "";

    public string ClientId { get; init; } = "";

    public string ClientSecret { get; init; } = "";
}
