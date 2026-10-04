using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Features.Recordings.GetRecording.Interfaces;

public interface IRecordingApi
{
    Task<byte[]?> GetFileAsync(string word, WordType wordType, CancellationToken cancellationToken = default);
}
