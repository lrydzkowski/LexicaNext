using Argon;

namespace LexicaNext.WebApp.Tests.Integration.Common.Services;

internal static class VerifySettingsBuilder
{
    public static VerifySettings Build()
    {
        VerifySettings settings = new();
        settings.ScrubInlineDateTimes("M/d/yyyy h:mm:ss tt");
        settings.DontIgnoreEmptyCollections();
        settings.AddExtraSettings(
            jsonSerializerSettings => jsonSerializerSettings.NullValueHandling = NullValueHandling.Include
        );

        return settings;
    }
}
