namespace LexicaNext.WebApp.Tests.Integration.Common.Models;

internal class ReceivedMethodCall
{
    public required string MethodName { get; init; }

    public required object?[] Arguments { get; init; }
}
