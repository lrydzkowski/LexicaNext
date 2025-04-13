namespace LexicaNext.Core.Queries.GetRecording.Interfaces;

public interface IRecordingStorage
{
    Task<byte[]?> GetFileAsync(string fileName, CancellationToken cancellationToken);

    Task SaveFileAsync(string fileName, byte[] file);
}
