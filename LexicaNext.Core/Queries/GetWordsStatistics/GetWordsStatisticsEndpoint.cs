using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWordsStatistics.Interfaces;
using LexicaNext.Core.Queries.GetWordsStatistics.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetWordsStatistics;

public static class GetWordsStatisticsEndpoint
{
    public const string Name = "GetWordsStatistics";

    public static void MapGetWordsStatisticsEndpoint(this WebApplication app)
    {
        app.MapGet("/api/words-statistics", HandleAsync)
            .WithName(Name)
            .WithSummary("Return per-word statistics for the current user's open-questions answers")
            .Produces<GetWordsStatisticsResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, Ok<GetWordsStatisticsResponse>, UnauthorizedHttpResult>>
        HandleAsync(
            [AsParameters] GetWordsStatisticsRequest request,
            [FromServices] IGetWordsStatisticsRequestProcessor processor,
            [FromServices] IGetWordsStatisticsRequestValidator validator,
            [FromServices] IListParametersMapper listParametersMapper,
            [FromServices] IGetWordsStatisticsRepository repository,
            [FromServices] IWordStatisticsRecordMapper recordMapper,
            [FromServices] IUserContextResolver userContextResolver,
            CancellationToken cancellationToken
        )
    {
        request = processor.Process(request);
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        ListParameters listParameters = listParametersMapper.Map(request);
        ListInfo<WordStatisticsRecord> records =
            await repository.GetWordsStatisticsAsync(userId, listParameters, cancellationToken);
        ListInfo<WordStatisticsRecordDto> recordsDto = recordMapper.Map(records);
        GetWordsStatisticsResponse response = new()
        {
            Count = recordsDto.Count,
            Data = recordsDto.Data
        };

        return TypedResults.Ok(response);
    }
}

public class GetWordsStatisticsRequest
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

public class GetWordsStatisticsResponse
{
    public int Count { get; init; }

    public List<WordStatisticsRecordDto> Data { get; init; } = [];
}

public class WordStatisticsRecordDto
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public int CorrectCount { get; init; }

    public int IncorrectCount { get; init; }
}
