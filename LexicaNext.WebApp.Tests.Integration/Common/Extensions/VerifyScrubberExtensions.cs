namespace LexicaNext.WebApp.Tests.Integration.Common.Extensions;

internal static class VerifyScrubberExtensions
{
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
