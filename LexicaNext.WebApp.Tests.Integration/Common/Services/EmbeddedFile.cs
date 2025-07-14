using System.Reflection;

namespace LexicaNext.WebApp.Tests.Integration.Common.Services;

public static class EmbeddedFile
{
    public static string GetContent(string path, Assembly? assembly = null)
    {
        assembly ??= typeof(EmbeddedFile).Assembly;
        path = ParsePath(path, assembly);

        using Stream? stream = assembly.GetManifestResourceStream(path);
        using StreamReader reader = new(stream!);
        string content = reader.ReadToEnd().Trim();

        return content;
    }

    public static byte[] Get(string path, Assembly? assembly = null)
    {
        assembly ??= typeof(EmbeddedFile).Assembly;
        path = ParsePath(path, assembly);

        using Stream? stream = assembly.GetManifestResourceStream(path);
        MemoryStream memoryStream = new();
        stream?.CopyTo(memoryStream);

        return memoryStream.ToArray();
    }

    public static Stream? GetStream(string path, Assembly? assembly = null)
    {
        assembly ??= typeof(EmbeddedFile).Assembly;
        path = ParsePath(path, assembly);

        return assembly.GetManifestResourceStream(path);
    }

    private static string ParsePath(string path, Assembly assembly)
    {
        path = TransformPath(path, assembly);
        if (!Exists(path, assembly))
        {
            throw new InvalidOperationException($"Embedded file doesn't exist: '{path}'.");
        }

        return path;
    }

    private static string TransformPath(string path, Assembly assembly)
    {
        string transformedPath = path.Replace('/', '.').Replace('\\', '.');

        return $"{assembly.GetName().Name}.{transformedPath}";
    }

    private static bool Exists(string path, Assembly assembly)
    {
        return assembly.GetManifestResourceNames().Any(x => x == path);
    }
}
