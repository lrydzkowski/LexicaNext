using LexicaNext.Core.Commands.CreateSet;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data;

internal class TestCaseData : ITestCaseData
{
    public CreateSetRequestPayload? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
