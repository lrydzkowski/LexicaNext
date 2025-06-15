using System.Linq.Dynamic.Core;
using LexicaNext.Core.Common.Infrastructure.Extensions;

namespace LexicaNext.Core.Common.Infrastructure.Lists.Extensions;

public static class SortExtensions
{
    public static IQueryable<T> Sort<T>(
        this IQueryable<T> query,
        List<string> fieldsAvailableToSort,
        Sorting sorting,
        string defaultSortingFieldName,
        SortingOrder defaultSortingOrder = SortingOrder.Ascending,
        Dictionary<string, string>? fieldNamesMapping = null
    )
    {
        if (sorting.FieldName is not null && !fieldsAvailableToSort.ContainsIgnoreCase(sorting.FieldName))
        {
            return query;
        }


        sorting = PrepareSortingParameters(sorting, defaultSortingFieldName, defaultSortingOrder, fieldNamesMapping);
        string sortOrderQuery = sorting.Order == SortingOrder.Ascending ? "" : " desc";
        string sortQuery = $"{sorting.FieldName}{sortOrderQuery}, {defaultSortingFieldName} asc";
        query = query.OrderBy(sortQuery);

        return query;
    }

    private static Sorting PrepareSortingParameters(
        Sorting sorting,
        string defaultSortingFieldName,
        SortingOrder defaultSortingOrder,
        Dictionary<string, string>? fieldNamesMapping = null
    )
    {
        if (sorting.FieldName is null)
        {
            return new Sorting
            {
                FieldName = defaultSortingFieldName,
                Order = defaultSortingOrder
            };
        }

        sorting = MapFieldName(sorting, fieldNamesMapping);

        return sorting;
    }

    private static Sorting MapFieldName(Sorting sorting, Dictionary<string, string>? fieldNamesMapping = null)
    {
        string fieldName = sorting.FieldName ?? "";
        if (fieldNamesMapping?.TryGetValue(fieldName, out string? value) is true)
        {
            sorting.FieldName = value;
        }

        return sorting;
    }
}
