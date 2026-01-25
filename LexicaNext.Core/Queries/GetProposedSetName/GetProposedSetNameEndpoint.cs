using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Queries.GetProposedSetName.Interfaces;
using LexicaNext.Core.Queries.GetProposedSetName.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetProposedSetName;

public static class GetProposedSetNameEndpoint
{
    public const string Name = "GetProposedSetName";

    public static void MapGetProposedSetNameEndpoint(this WebApplication app)
    {
        app.MapGet("/api/sets/proposed-name", HandleAsync)
            .WithName(Name)
            .WithSummary("Return the next proposed set name in format set_XXXX")
            .Produces<GetProposedSetNameResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<Ok<GetProposedSetNameResponse>, UnauthorizedHttpResult>> HandleAsync(
        [FromServices] IGetProposedSetNameRepository repository,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        string proposedName = await repository.GetProposedSetNameAsync(userId, cancellationToken);

        return TypedResults.Ok(new GetProposedSetNameResponse { ProposedName = proposedName });
    }
}
