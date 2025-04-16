using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetSets.Interfaces;
using LexicaNext.Core.Queries.GetSets.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetSets;

public static class GetSetsEndpoint
{
    public const string Name = "GetSets";

    public static void MapGetSetsEndpoint(this WebApplication app)
    {
        app.MapGet("/api/sets", HandleAsync).WithName(Name).RequireAuthorization();
    }

    private static async Task<Results<ProblemHttpResult, Ok<GetSetsResponse>>> HandleAsync(
        [AsParameters] GetSetsRequest getSetsRequest,
        IValidator<GetSetsRequest> validator,
        IListParametersMapper listParametersMapper,
        IGetSetsRepository getSetsRepository,
        ISetRecordMapper setRecordMapper,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(getSetsRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        ListParameters listParameters = listParametersMapper.Map(getSetsRequest);
        ListInfo<SetRecord> setRecords = await getSetsRepository.GetSetsAsync(listParameters, cancellationToken);
        ListInfo<SetRecordDto> setRecordsDto = setRecordMapper.Map(setRecords);
        GetSetsResponse response = new()
        {
            Count = setRecordsDto.Count,
            Data = setRecordsDto.Data
        };

        return TypedResults.Ok(response);
    }
}

public class GetSetsRequest
{
    [FromQuery(Name = "page")]
    public int Page => 1;

    [FromQuery(Name = "pageSize")]
    public int PageSize => 100;

    [FromQuery(Name = "sortingFieldName")]
    public string? SortingFieldName { get; init; }

    [FromQuery(Name = "sortingOrder")]
    public string SortingOrder => "asc";

    [FromQuery(Name = "searchQuery")]
    public string? SearchQuery { get; init; }
}

public class GetSetsResponse
{
    public int Count { get; init; }

    public List<SetRecordDto> Data { get; init; } = [];
}

public class SetRecordDto
{
    public Guid SetId { get; init; }

    public string Name { get; init; } = "";

    public DateTimeOffset CreatedAt { get; init; }
}
