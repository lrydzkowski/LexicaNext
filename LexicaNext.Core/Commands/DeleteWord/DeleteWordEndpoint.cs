using LexicaNext.Core.Commands.DeleteWord.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.DeleteWord;

public static class DeleteWordEndpoint
{
    public const string Name = "DeleteWord";

    public static void MapDeleteWordEndpoint(this WebApplication app)
    {
        app.MapDelete("/api/words/{wordId}", HandleAsync)
            .WithName(Name)
            .WithSummary("Delete an existing word")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, NoContent>> HandleAsync(
        [AsParameters] DeleteWordRequest request,
        [FromServices] IDeleteWordRepository deleteWordRepository,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.WordId, out Guid wordId))
        {
            return TypedResults.NotFound();
        }

        await deleteWordRepository.DeleteWordAsync(wordId, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteWordRequest
{
    public string WordId { get; init; } = "";
}
