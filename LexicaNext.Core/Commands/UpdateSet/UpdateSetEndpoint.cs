using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Commands.UpdateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.UpdateSet;

public static class UpdateSetEndpoint
{
    public const string Name = "UpdateSet";

    public static void MapUpdateSetEndpoint(this WebApplication app)
    {
        app.MapPut("/api/sets/{setId}", HandleAsync)
            .WithName(Name)
            .WithSummary("Update an existing set")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, ProblemHttpResult, NoContent>> HandleAsync(
        [AsParameters] UpdateSetRequest request,
        [FromServices] IValidator<UpdateSetRequest> validator,
        [FromServices] IUpdateSetCommandMapper updateSetCommandMapper,
        [FromServices] IUpdateSetRepository updateSetRepository,
        [FromServices] IUserContextResolver userContextResolver,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.SetId, out Guid setId))
        {
            return TypedResults.NotFound();
        }

        string userId = userContextResolver.GetUserId();
        bool exists = await updateSetRepository.SetExistsAsync(userId, setId, cancellationToken);
        if (!exists)
        {
            return TypedResults.NotFound();
        }

        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        UpdateSetCommand command = updateSetCommandMapper.Map(userId, request);
        await updateSetRepository.UpdateSetAsync(command, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class UpdateSetRequest
{
    public string SetId { get; set; } = "";

    [FromBody]
    public UpdateSetRequestPayload? Payload { get; init; }
}

public class UpdateSetRequestPayload
{
    public List<string> WordIds { get; set; } = [];
}
