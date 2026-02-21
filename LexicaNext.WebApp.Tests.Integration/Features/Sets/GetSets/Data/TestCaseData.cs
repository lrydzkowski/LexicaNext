using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data;

internal class TestCaseData : ITestCaseData
{
    public int? Page { get; init; }

    public int? PageSize { get; init; }

    public string? SortingFieldName { get; init; }

    public string? SortingOrder { get; init; }

    public string? SearchQuery { get; init; }

    public string? TimeZoneId { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
