using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Library has 25 in-set words. Expected: 200 OK with exactly 20 entries (capped).
internal static class TestCase04
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid setId = Guid.Parse("0199e872-1000-7000-8000-000000000001");

        List<WordEntity> words = [];
        List<SetWordEntity> setWords = [];
        List<Guid> wordIds = [];
        for (int i = 0; i < 25; i++)
        {
            Guid wordId = Guid.Parse($"0199e872-2000-7000-8000-{i + 1:D12}");
            wordIds.Add(wordId);
            words.Add(
                new WordEntity
                {
                    WordId = wordId,
                    UserId = "test-user-id",
                    Word = $"word{i:D2}",
                    WordTypeId = NounTypeId,
                    CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero).AddMinutes(i)
                }
            );
            setWords.Add(new SetWordEntity { SetId = setId, WordId = wordId, Order = i });
        }

        return new TestCaseData
        {
            TestCaseId = 4,
            ExpectedCount = 20,
            ExpectedWordIdPool = wordIds,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words = words,
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = setId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords = setWords
                }
            }
        };
    }
}
