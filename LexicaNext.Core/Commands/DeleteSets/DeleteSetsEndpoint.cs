using FluentValidation.Results;
using LexicaNext.Core.Commands.DeleteSets.Interfaces;
using LexicaNext.Core.Commands.DeleteSets.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
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
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, NoContent, UnauthorizedHttpResult>> HandleAsync(
        [FromBody] DeleteSetsRequest request,
        [FromServices] IDeleteSetsRequestValidator validator,
        [FromServices] IDeleteSetsRepository deleteSetsRepository,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        List<Guid> setIds = request.Ids
            .Select(id => Guid.TryParse(id, out Guid guid) ? guid : (Guid?)null)
            .Where(guid => guid.HasValue)
            .Cast<Guid>()
            .ToList();

        await deleteSetsRepository.DeleteSetsAsync(userId, setIds, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteSetsRequest
{
    public List<string> Ids { get; init; } = [];
}
