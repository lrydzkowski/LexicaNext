using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Queries.GetWordsStatistics.Services;

internal interface IGetWordsStatisticsRequestProcessor
{
    GetWordsStatisticsRequest Process(GetWordsStatisticsRequest request);
}

internal class GetWordsStatisticsRequestProcessor
    : ISingletonService, IGetWordsStatisticsRequestProcessor
{
    public GetWordsStatisticsRequest Process(GetWordsStatisticsRequest request)
    {
        return new GetWordsStatisticsRequest
        {
            Page = request.Page ?? 1,
            PageSize = request.PageSize ?? 25,
            SortingFieldName = request.SortingFieldName?.Trim() ?? "incorrectCount",
            SortingOrder = request.SortingOrder?.Trim()?.ToLower() ?? "desc",
            SearchQuery = request.SearchQuery?.Trim(),
            TimeZoneId = request.TimeZoneId
        };
    }
}
