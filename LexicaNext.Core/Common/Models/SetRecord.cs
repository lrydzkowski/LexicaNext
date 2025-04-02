namespace LexicaNext.Core.Common.Models;

public class SetRecord
{
    public Guid SetId { get; init; }

    public string Name { get; init; } = "";

    public DateTimeOffset CreatedAt { get; init; }
}
