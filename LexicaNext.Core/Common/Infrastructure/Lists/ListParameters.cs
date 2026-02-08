using LexicaNext.Core.Common.Infrastructure.Extensions;

namespace LexicaNext.Core.Common.Infrastructure.Lists;

public class ListParameters
{
    public Pagination Pagination { get; init; } = new();

    public Sorting Sorting { get; init; } = new();

    public Search Search { get; init; } = new();
}

public class Pagination
{
    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 100;
}

public class Sorting
{
    public string? FieldName { get; set; }

    public SortingOrder Order { get; init; } = SortingOrder.Ascending;
}

public enum SortingOrder
{
    Ascending,
    Descending
}

public static class SortingOrderConstants
{
    public const string Ascending = "asc";

    public const string Descending = "desc";

    public static readonly IReadOnlyList<string> All = [Ascending, Descending];

    public static bool IsCorrect(string? sortingOrder)
    {
        return sortingOrder is not null && All.ContainsIgnoreCase(sortingOrder);
    }

    public static string Serialize()
    {
        return $"'{string.Join("', '", All)}'";
    }
}

public class Search
{
    public string? Query { get; init; }

    public string? TimeZoneId { get; init; }
}
