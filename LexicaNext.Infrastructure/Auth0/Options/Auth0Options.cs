namespace LexicaNext.Infrastructure.Auth0.Options;

internal class Auth0Options
{
    public const string Position = "Auth0";

    public string Domain { get; init; } = "";

    public string Audience { get; init; } = "";

    public string RoleClaimName { get; init; } = "";
}
