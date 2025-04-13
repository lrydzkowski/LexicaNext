using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Infrastructure.Storage.Services;

internal interface IFileHandler
{
    bool Exists(string path);

    Task<byte[]> ReadAllBytesAsync(string path, CancellationToken cancellationToken = new());

    Task WriteAllBytesAsync(string path, byte[] bytes, CancellationToken cancellationToken = new());
}

internal class FileHandler
    : ISingletonService, IFileHandler
{
    public bool Exists(string path)
    {
        return File.Exists(path);
    }

    public async Task<byte[]> ReadAllBytesAsync(string path, CancellationToken cancellationToken = new())
    {
        return await File.ReadAllBytesAsync(path, cancellationToken);
    }

    public async Task WriteAllBytesAsync(string path, byte[] bytes, CancellationToken cancellationToken = new())
    {
        await File.WriteAllBytesAsync(path, bytes, cancellationToken);
    }
}
