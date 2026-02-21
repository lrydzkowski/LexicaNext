namespace LexicaNext.WebApp.Tests.Integration.Common.Extensions;

internal static class StringExtensions
{
    public static string AddIndentation(this string text, int spaces = 4)
    {
        string indentation = new(' ', spaces);
        return string.Join(
            Environment.NewLine,
            text.Split(Environment.NewLine).Select(line => indentation + line)
        );
    }
}
