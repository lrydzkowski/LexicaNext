using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWordSets.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetWordSets;

public static class GetWordSetsEndpoint
{
    public const string Name = "GetWordSets";

    public static void MapGetWordSetsEndpoint(this WebApplication app)
    {
        app.MapGet("/api/words/{wordId}/sets", HandleAsync)
            .WithName(Name)
            .WithSummary("Return the sets that contain a specific word")
            .Produces<GetWordSetsResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, Ok<GetWordSetsResponse>, UnauthorizedHttpResult>> HandleAsync(
        [AsParameters] GetWordSetsRequest request,
        [FromServices] IGetWordSetsRepository getWordSetsRepository,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.WordId, out Guid wordId))
        {
            return TypedResults.Ok(new GetWordSetsResponse());
        }

        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        List<SetRecord> sets = await getWordSetsRepository.GetWordSetsAsync(userId, wordId, cancellationToken);
        GetWordSetsResponse response = new()
        {
            Sets = sets.Select(
                    s => new SetRecordDto
                    {
                        SetId = s.SetId,
                        Name = s.Name,
                        CreatedAt = s.CreatedAt
                    }
                )
                .ToList()
        };

        return TypedResults.Ok(response);
    }
}

public class GetWordSetsRequest
{
    public string WordId { get; init; } = "";
}

public class GetWordSetsResponse
{
    public List<SetRecordDto> Sets { get; init; } = [];
}

public class SetRecordDto
{
    public Guid SetId { get; init; }

    public string Name { get; init; } = "";

    public DateTimeOffset CreatedAt { get; init; }
}
