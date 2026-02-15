using System.Text.RegularExpressions;
using Argon;
using LexicaNext.WebApp.Tests.Integration.Common.Extensions;

namespace LexicaNext.WebApp.Tests.Integration.Common.Services;

internal static class VerifySettingsBuilder
{
    public static VerifySettings Build()
    {
        VerifySettings settings = new();
        settings.ScrubInlineGuids();
        settings.ScrubInlineDateTimes("M/d/yyyy h:mm:ss tt");
        settings.ScrubInlineDateTimes("yyyy-MM-ddTHH:mm:ss.fffffffzzz");
        settings.ScrubNewLineCharacters();
        settings.ScrubCustomBlankCharacters();
        settings.ScrubTraceId();
        settings.ScrubPostgresConnectionString();
        settings.DontIgnoreEmptyCollections();
        settings.AddExtraSettings(
            jsonSerializerSettings => jsonSerializerSettings.NullValueHandling = NullValueHandling.Include
        );

        return settings;
    }

    private static void ScrubPostgresConnectionString(this VerifySettings settings)
    {
        settings.AddScrubber(
            input =>
            {
                string original = input.ToString();
                string updated = Regex.Replace(original, @"Host=[\w.\-]+:\d+", "Host=localhost:5432");

                input.Clear();
                input.Append(updated);
            }
        );
    }
}
