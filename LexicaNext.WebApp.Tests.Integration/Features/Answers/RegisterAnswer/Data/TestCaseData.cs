using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data;

internal class TestCaseData : ITestCaseData
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public RegisterAnswerRequestPayload? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new()
    {
        Db = new DbTestCaseData
        {
            Words =
            [
                new WordEntity
                {
                    WordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002"),
                    UserId = "test-user-id",
                    Word = "apple",
                    WordTypeId = NounTypeId,
                    CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                }
            ]
        }
    };
}
