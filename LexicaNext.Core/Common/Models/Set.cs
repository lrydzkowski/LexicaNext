namespace LexicaNext.Core.Common.Models;

public class Set
{
    public Guid SetId { get; init; }

    public string Name { get; init; } = "";

    public List<Entry> Entries { get; init; } = [];

    public DateTimeOffset CreatedAt { get; init; }
}
