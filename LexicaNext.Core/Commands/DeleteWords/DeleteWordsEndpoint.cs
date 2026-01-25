using LexicaNext.Core.Commands.DeleteWords.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.DeleteWords;

public static class DeleteWordsEndpoint
{
    public const string Name = "DeleteWords";

    public static void MapDeleteWordsEndpoint(this WebApplication app)
    {
        app.MapDelete("/api/words", HandleAsync)
            .WithName(Name)
            .WithSummary("Delete multiple words")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NoContent, UnauthorizedHttpResult>> HandleAsync(
        [FromBody] DeleteWordsRequest request,
        [FromServices] IDeleteWordsRepository deleteWordsRepository,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        List<Guid> wordIds = request.Ids
            .Select(id => Guid.TryParse(id, out Guid guid) ? guid : (Guid?)null)
            .Where(guid => guid.HasValue)
            .Cast<Guid>()
            .ToList();

        await deleteWordsRepository.DeleteWordsAsync(userId, wordIds, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteWordsRequest
{
    public List<string> Ids { get; init; } = [];
}
