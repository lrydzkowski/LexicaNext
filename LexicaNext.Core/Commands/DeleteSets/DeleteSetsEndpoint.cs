using LexicaNext.Core.Commands.DeleteSets.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.DeleteSets;

public static class DeleteSetsEndpoint
{
    public const string Name = "DeleteSets";

    public static void MapDeleteSetsEndpoint(this WebApplication app)
    {
        app.MapDelete("/api/sets", HandleAsync)
            .WithName(Name)
            .WithSummary("Delete multiple sets")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<NoContent> HandleAsync(
        [FromBody] DeleteSetsRequest request,
        [FromServices] IDeleteSetsRepository deleteSetsRepository,
        CancellationToken cancellationToken
    )
    {
        List<Guid> setIds = request.Ids
            .Select(id => Guid.TryParse(id, out Guid guid) ? guid : (Guid?)null)
            .Where(guid => guid.HasValue)
            .Cast<Guid>()
            .ToList();

        await deleteSetsRepository.DeleteSetsAsync(setIds, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteSetsRequest
{
    public List<string> Ids { get; init; } = [];
}
