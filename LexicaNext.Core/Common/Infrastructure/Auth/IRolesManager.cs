namespace LexicaNext.Core.Common.Infrastructure.Auth;

public interface IRolesManager
{
    IReadOnlyList<string> Roles { get; }
}
