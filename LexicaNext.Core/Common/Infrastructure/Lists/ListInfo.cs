namespace LexicaNext.Core.Common.Infrastructure.Lists;

public class ListInfo<T> where T : new()
{
    public int Count { get; init; }

    public List<T> Data { get; init; } = [];
}
