using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries.Interfaces;
using LexicaNext.Core.Queries.GetSet;
using LexicaNext.Core.Queries.GetSet.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries;

public static class GetRandomOpenQuestionsPracticeEntriesEndpoint
{
    public const string Name = "GetRandomOpenQuestionsPracticeEntries";

    private const int PracticeEntriesCount = 20;

    public static void MapGetRandomOpenQuestionsPracticeEntriesEndpoint(this WebApplication app)
    {
        app.MapGet("/api/practice/open-questions/random", HandleAsync)
            .WithName(Name)
            .WithSummary("Return up to 20 random words for the user's open-questions practice")
            .Produces<GetRandomOpenQuestionsPracticeEntriesResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<Ok<GetRandomOpenQuestionsPracticeEntriesResponse>, UnauthorizedHttpResult>>
        HandleAsync(
            [FromServices] IGetRandomOpenQuestionsPracticeEntriesRepository repository,
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

        List<Entry> entries = await repository.GetRandomEntriesAsync(userId, PracticeEntriesCount, cancellationToken);
        List<EntryDto> entriesDto = entryMapper.Map(entries);
        GetRandomOpenQuestionsPracticeEntriesResponse response = new()
        {
            Entries = entriesDto
        };

        return TypedResults.Ok(response);
    }
}

public class GetRandomOpenQuestionsPracticeEntriesResponse
{
    public List<EntryDto> Entries { get; init; } = [];
}
