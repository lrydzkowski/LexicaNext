using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;

namespace LexicaNext.Core.Queries.GetSets.Services;

public interface IListParametersMapper
{
    ListParameters Map(GetSetsRequest request);
}

internal class ListParametersMapper
    : ISingletonService, IListParametersMapper
{
    public ListParameters Map(GetSetsRequest request)
    {
        return new ListParameters
        {
            Pagination = new Pagination
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            Sorting = new Sorting
            {
                FieldName = request.SortingFieldName?.Trim(),
                Order = MapToSortingOrder(request.SortingOrder)
            },
            Search = new Search
            {
                Query = request.SearchQuery?.Trim()
            }
        };
    }

    private SortingOrder MapToSortingOrder(string sortingOrder)
    {
        return sortingOrder switch
        {
            "desc" => SortingOrder.Descending,
            _ => SortingOrder.Ascending
        };
    }
}
