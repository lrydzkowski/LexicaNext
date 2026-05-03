using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetSet;
using LexicaNext.Core.Queries.GetSet.Services;
using LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries;

public static class GetWeakestOpenQuestionsPracticeEntriesEndpoint
{
    public const string Name = "GetWeakestOpenQuestionsPracticeEntries";

    private const int PracticeEntriesCount = 20;

    public static void MapGetWeakestOpenQuestionsPracticeEntriesEndpoint(this WebApplication app)
    {
        app.MapGet("/api/practice/open-questions/weakest", HandleAsync)
            .WithName(Name)
            .WithSummary(
                "Return up to 20 words with the worst open-questions answer history for the user's practice"
            )
            .Produces<GetWeakestOpenQuestionsPracticeEntriesResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<Ok<GetWeakestOpenQuestionsPracticeEntriesResponse>, UnauthorizedHttpResult>>
        HandleAsync(
            [FromServices] IGetWeakestOpenQuestionsPracticeEntriesRepository repository,
            [FromServices] ISetMapper entryMapper,
            [FromServices] IUserContextResolver userContextResolver,
            CancellationToken cancellationToken
        )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        List<Entry> entries = await repository.GetWeakestEntriesAsync(userId, PracticeEntriesCount, cancellationToken);
        List<EntryDto> entriesDto = entryMapper.Map(entries);
        GetWeakestOpenQuestionsPracticeEntriesResponse response = new()
        {
            Entries = entriesDto
        };

        return TypedResults.Ok(response);
    }
}

public class GetWeakestOpenQuestionsPracticeEntriesResponse
{
    public List<EntryDto> Entries { get; init; } = [];
}
