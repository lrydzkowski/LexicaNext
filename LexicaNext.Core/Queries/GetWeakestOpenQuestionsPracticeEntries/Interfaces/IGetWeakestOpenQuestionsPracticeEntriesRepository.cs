using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries.Interfaces;

public interface IGetWeakestOpenQuestionsPracticeEntriesRepository
{
    Task<List<Entry>> GetWeakestEntriesAsync(string userId, int count, CancellationToken cancellationToken = default);
}
