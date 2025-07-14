using System.Collections.Concurrent;

namespace LexicaNext.WebApp.Tests.Integration.Common.Logging;

public class LogMessages
{
    public readonly HashSet<string> AllowedCategories = [];

    public ConcurrentQueue<string> Messages { get; } = [];

    public void Clear()
    {
        Messages.Clear();
        AllowedCategories.Clear();
    }

    public bool IsCategoryAllowed(string categoryName)
    {
        return AllowedCategories.Any(categoryName.Contains);
    }

    public string GetSerialized(int indentSpaces = 0)
    {
        string indentation = new(' ', indentSpaces);

        return string.Join(
            Environment.NewLine,
            Messages.Select(
                message =>
                {
                    string[] lines = message.Split([Environment.NewLine], StringSplitOptions.None);
                    return string.Join(Environment.NewLine, lines.Select(line => indentation + line));
                }
            )
        );
    }
}
