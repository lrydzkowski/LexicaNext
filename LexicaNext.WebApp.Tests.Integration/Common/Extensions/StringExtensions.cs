using System.Text.Json;

namespace LexicaNext.WebApp.Tests.Integration.Common.Extensions;

internal static class StringExtensions
{
    public static string PrettifyJson(this string json)
    {
        using JsonDocument doc = JsonDocument.Parse(json);
        return JsonSerializer.Serialize(doc, new JsonSerializerOptions { WriteIndented = true });
    }

    public static string AddIndentation(this string text, int spaces = 4)
    {
        string indentation = new(' ', spaces);
        return string.Join(
            Environment.NewLine,
            text.Split(Environment.NewLine).Select(line => indentation + line)
        );
    }
}
