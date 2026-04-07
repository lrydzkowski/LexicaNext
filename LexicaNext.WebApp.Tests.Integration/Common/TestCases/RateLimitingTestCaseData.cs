namespace LexicaNext.WebApp.Tests.Integration.Common.TestCases;

internal class RateLimitingTestCaseData
{
    public int PermitLimit { get; init; }

    public string WindowTime { get; init; } = "00:01:00";

    public int NumberOfPreRequests { get; init; }
}
