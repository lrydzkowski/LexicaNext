using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;

// Pagination: 5 words, pageSize=2, page=2 → expect rows 3 and 4.
internal static class TestCase07
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid[] wordIds =
        [
            Guid.Parse("0199e86c-7000-7000-8000-000000000001"),
            Guid.Parse("0199e86c-7000-7000-8000-000000000002"),
            Guid.Parse("0199e86c-7000-7000-8000-000000000003"),
            Guid.Parse("0199e86c-7000-7000-8000-000000000004"),
            Guid.Parse("0199e86c-7000-7000-8000-000000000005")
        ];
        string[] words = ["alpha", "bravo", "charlie", "delta", "echo"];

        List<WordEntity> wordEntities = [];
        List<AnswerEntity> answerEntities = [];
        for (int i = 0; i < wordIds.Length; i++)
        {
            wordEntities.Add(new WordEntity
            {
                WordId = wordIds[i],
                UserId = "test-user-id",
                Word = words[i],
                WordTypeId = NounTypeId,
                CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero).AddDays(i)
            });

            // Each word has exactly 1 incorrect answer so default sort falls back to word asc.
            answerEntities.Add(new AnswerEntity
            {
                AnswerId = Guid.Parse($"0199e86d-7000-7000-8000-{i + 1:D12}"),
                UserId = "test-user-id",
                ModeType = "open-questions",
                QuestionType = "english-open",
                Question = words[i],
                GivenAnswer = "wrong",
                ExpectedAnswer = words[i],
                IsCorrect = false,
                AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero).AddMinutes(i),
                WordId = wordIds[i]
            });
        }

        return new TestCaseData
        {
            TestCaseId = 7,
            Page = 2,
            PageSize = 2,
            SortingFieldName = "word",
            SortingOrder = "asc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words = wordEntities,
                    Answers = answerEntities
                }
            }
        };
    }
}
