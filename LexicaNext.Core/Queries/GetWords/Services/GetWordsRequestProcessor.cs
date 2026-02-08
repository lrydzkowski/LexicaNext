using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Queries.GetWords.Services;

internal interface IGetWordsRequestProcessor
{
    GetWordsRequest Process(GetWordsRequest request);
}

internal class GetWordsRequestProcessor
    : ISingletonService, IGetWordsRequestProcessor
{
    public GetWordsRequest Process(GetWordsRequest request)
    {
        return new GetWordsRequest
        {
            Page = request.Page ?? 1,
            PageSize = request.PageSize ?? 25,
            SortingFieldName = request.SortingFieldName?.Trim(),
            SortingOrder = request.SortingOrder?.Trim() ?? "desc",
            SearchQuery = request.SearchQuery?.Trim(),
            TimeZoneId = request.TimeZoneId
        };
    }
}
