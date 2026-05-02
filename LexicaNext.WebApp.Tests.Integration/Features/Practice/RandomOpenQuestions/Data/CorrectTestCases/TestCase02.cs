using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Words exist but none belong to any set. Expected: 200 OK with empty entries.
internal static class TestCase02
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordA = Guid.Parse("0199e870-1000-7000-8000-000000000001");
        Guid wordB = Guid.Parse("0199e870-1000-7000-8000-000000000002");

        return new TestCaseData
        {
            TestCaseId = 2,
            ExpectedCount = 0,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordA,
                            UserId = "test-user-id",
                            Word = "alpha",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = wordB,
                            UserId = "test-user-id",
                            Word = "bravo",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 2, 0, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
