using LexicaNext.Core.Commands.CreateWord;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

// Duplicate word and word type combination already exists. Expected: 400 Bad Request.
internal static class TestCase08
{
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 8,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "run",
                WordType = "verb",
                Translations = ["biegać"],
                ExampleSentences = []
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(),
                            UserId = "test-user-id",
                            Word = "run",
                            WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
