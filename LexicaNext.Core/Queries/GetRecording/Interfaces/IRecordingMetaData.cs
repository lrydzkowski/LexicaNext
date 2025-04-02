using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetRecording.Interfaces;

public interface IRecordingMetaData
{
    Task<string?> GetFileNameAsync(string word, WordType wordType, CancellationToken cancellationToken = default);

    Task AddFileNameAsync(
        string word,
        WordType wordType,
        string fileName,
        CancellationToken cancellationToken = default
    );
}
