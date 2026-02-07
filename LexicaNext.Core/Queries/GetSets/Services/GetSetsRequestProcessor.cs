using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Queries.GetSets.Services;

internal interface IGetSetsRequestProcessor
{
    GetSetsRequest Process(GetSetsRequest request);
}

internal class GetSetsRequestProcessor
    : ISingletonService, IGetSetsRequestProcessor
{
    public GetSetsRequest Process(GetSetsRequest request)
    {
        return new GetSetsRequest
        {
            Page = request.Page ?? 1,
            PageSize = request.PageSize ?? 25,
            SortingFieldName = request.SortingFieldName?.Trim(),
            SortingOrder = request.SortingOrder?.Trim() ?? "asc",
            SearchQuery = request.SearchQuery?.Trim(),
            TimezoneOffsetMinutes = request.TimezoneOffsetMinutes
        };
    }
}
