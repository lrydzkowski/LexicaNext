using System.Text.RegularExpressions;

namespace LexicaNext.WebApp.Tests.Integration.Common.Extensions;

internal static partial class VerifyScrubberExtensions
{
    public static void ScrubTraceId(this VerifySettings settings)
    {
        settings.AddScrubber(
            input =>
            {
                string original = input.ToString();
                string updated = TraceIdRegex().Replace(original, "\"traceId\": \"Scrubbed\"");

                input.Clear();
                input.Append(updated);
            }
        );
    }

    [GeneratedRegex("\"traceId\":\\s*\"[^\"]+\"")]
    private static partial Regex TraceIdRegex();
    public static void ScrubNewLineCharacters(this VerifySettings settings)
    {
        settings.AddScrubber(
            input =>
            {
                string original = input.ToString();
                string updated = original.Replace("\\r\\n", " ").Replace("\\n", " ");

                input.Clear();
                input.Append(updated);
            }
        );
    }

    public static void ScrubCustomBlankCharacters(this VerifySettings settings)
    {
        settings.AddScrubber(
            input =>
            {
                string original = input.ToString();
                string updated = original.Replace("\\u202F", " ");

                input.Clear();
                input.Append(updated);
            }
        );
    }
}
