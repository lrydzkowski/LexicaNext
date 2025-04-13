using System.Text.Json;

namespace LexicaNext.Core.Common.Infrastructure.Extensions;

public static class StringExtensions
{
    public static bool EqualsIgnoreCase(this string? str, string? value)
    {
        return string.Equals(str, value, StringComparison.InvariantCultureIgnoreCase);
    }

    public static string? PrettifyJson(this string? json, int indentSpaces = 0)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return json;
        }

        JsonElement jsonElement;
        try
        {
            jsonElement = JsonSerializer.Deserialize<JsonElement>(json);
        }
        catch
        {
            return json;
        }

        string prettyJson = JsonSerializer.Serialize(
            jsonElement,
            new JsonSerializerOptions
            {
                WriteIndented = true
            }
        );

        if (indentSpaces > 0)
        {
            string indent = new(' ', indentSpaces);
            prettyJson = indent + prettyJson.Replace("\n", "\n" + indent);
        }

        return prettyJson;
    }
}
