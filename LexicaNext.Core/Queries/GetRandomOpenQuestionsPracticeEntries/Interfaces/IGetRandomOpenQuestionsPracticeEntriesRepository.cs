using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries.Interfaces;

public interface IGetRandomOpenQuestionsPracticeEntriesRepository
{
    Task<List<Entry>> GetRandomEntriesAsync(string userId, int count, CancellationToken cancellationToken = default);
}
