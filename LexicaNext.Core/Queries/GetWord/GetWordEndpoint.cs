using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;
using LexicaNext.Core.Queries.GetWord.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetWord;

public static class GetWordEndpoint
{
    public const string Name = "GetWord";

    public static void MapGetWordEndpoint(this WebApplication app)
    {
        app.MapGet("/api/words/{wordId}", HandleAsync)
            .WithName(Name)
            .WithSummary("Return a word represented by the given id")
            .Produces<GetWordResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, Ok<GetWordResponse>, UnauthorizedHttpResult>> HandleAsync(
        [AsParameters] GetWordRequest request,
        [FromServices] IGetWordRepository getWordRepository,
        [FromServices] IWordMapper wordMapper,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.WordId, out Guid wordId))
        {
            return TypedResults.NotFound();
        }

        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        Word? word = await getWordRepository.GetWordAsync(userId, wordId, cancellationToken);
        if (word is null)
        {
            return TypedResults.NotFound();
        }

        GetWordResponse response = wordMapper.Map(word);

        return TypedResults.Ok(response);
    }
}

public class GetWordRequest
{
    public string WordId { get; init; } = "";
}

public class GetWordResponse
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public string WordType { get; init; } = "";

    public List<string> Translations { get; init; } = [];

    public List<string> ExampleSentences { get; init; } = [];

    public DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? UpdatedAt { get; init; }
}
