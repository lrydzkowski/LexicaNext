using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
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
        app.MapGet("/api/sets", HandleAsync)
            .WithName(Name)
            .WithSummary("Return the list of sets")
            .Produces<GetSetsResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, Ok<GetSetsResponse>, UnauthorizedHttpResult>> HandleAsync(
        [AsParameters] GetSetsRequest getSetsRequest,
        [FromServices] IGetSetsRequestProcessor processor,
        [FromServices] IGetSetsRequestValidator validator,
        [FromServices] IListParametersMapper listParametersMapper,
        [FromServices] IGetSetsRepository getSetsRepository,
        [FromServices] ISetRecordMapper setRecordMapper,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        getSetsRequest = processor.Process(getSetsRequest);
        ValidationResult? validationResult = await validator.ValidateAsync(getSetsRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        ListParameters listParameters = listParametersMapper.Map(getSetsRequest);
        ListInfo<SetRecord> setRecords =
            await getSetsRepository.GetSetsAsync(userId, listParameters, cancellationToken);
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
    public int? Page { get; init; }

    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; }

    [FromQuery(Name = "sortingFieldName")]
    public string? SortingFieldName { get; init; }

    [FromQuery(Name = "sortingOrder")]
    public string? SortingOrder { get; init; }

    [FromQuery(Name = "searchQuery")]
    public string? SearchQuery { get; init; }

    [FromQuery(Name = "timeZoneId")]
    public string? TimeZoneId { get; init; }
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
