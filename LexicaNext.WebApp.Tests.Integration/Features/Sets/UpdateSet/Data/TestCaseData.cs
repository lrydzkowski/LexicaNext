using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data;

internal class TestCaseData : ITestCaseData
{
    public string SetId { get; init; } = "";

    public UpdateSetRequestPayload? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
