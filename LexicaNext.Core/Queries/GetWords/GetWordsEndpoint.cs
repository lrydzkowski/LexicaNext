using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWords.Interfaces;
using LexicaNext.Core.Queries.GetWords.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using IListParametersMapper = LexicaNext.Core.Queries.GetWords.Services.IListParametersMapper;

namespace LexicaNext.Core.Queries.GetWords;

public static class GetWordsEndpoint
{
    public const string Name = "GetWords";

    public static void MapGetWordsEndpoint(this WebApplication app)
    {
        app.MapGet("/api/words", HandleAsync)
            .WithName(Name)
            .WithSummary("Return the list of words")
            .Produces<GetWordsResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, Ok<GetWordsResponse>, UnauthorizedHttpResult>> HandleAsync(
        [AsParameters] GetWordsRequest getWordsRequest,
        [FromServices] IGetWordsRequestProcessor processor,
        [FromServices] IValidator<GetWordsRequest> validator,
        [FromServices] IListParametersMapper listParametersMapper,
        [FromServices] IGetWordsRepository getWordsRepository,
        [FromServices] IWordRecordMapper wordRecordMapper,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        getWordsRequest = processor.Process(getWordsRequest);
        ValidationResult? validationResult = await validator.ValidateAsync(getWordsRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        ListParameters listParameters = listParametersMapper.Map(getWordsRequest);
        ListInfo<WordRecord> wordRecords =
            await getWordsRepository.GetWordsAsync(userId, listParameters, cancellationToken);
        ListInfo<WordRecordDto> wordRecordsDto = wordRecordMapper.Map(wordRecords);
        GetWordsResponse response = new()
        {
            Count = wordRecordsDto.Count,
            Data = wordRecordsDto.Data
        };

        return TypedResults.Ok(response);
    }
}

public class GetWordsRequest
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

public class GetWordsResponse
{
    public int Count { get; init; }

    public List<WordRecordDto> Data { get; init; } = [];
}

public class WordRecordDto
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public string WordType { get; init; } = "";

    public DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? UpdatedAt { get; init; }
}
