using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.CreateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Queries.GetSet;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.CreateSet;

public static class CreateSetEndpoint
{
    public const string Name = "CreateSet";

    public static void MapCreateSetEndpoint(this WebApplication app)
    {
        app.MapPost("/api/sets", HandleAsync)
            .WithName(Name)
            .WithSummary("Create a new set")
            .Produces<CreateSetResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, CreatedAtRoute<CreateSetResponse>, UnauthorizedHttpResult>>
        HandleAsync(
            [AsParameters] CreateSetRequest request,
            [FromServices] IValidator<CreateSetRequest> validator,
            [FromServices] ICreateSetCommandMapper createSetCommandMapper,
            [FromServices] ICreateSetRepository createSetRepository,
            [FromServices] IUserContextResolver userContextResolver,
            CancellationToken cancellationToken
        )
    {
        string? userId = userContextResolver.GetUserId();
        if (userId == null)
        {
            return TypedResults.Unauthorized();
        }

        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        CreateSetCommand command = createSetCommandMapper.Map(userId, request);
        Guid setId = await createSetRepository.CreateSetAsync(command, cancellationToken);
        CreateSetResponse response = new()
        {
            SetId = setId
        };

        return TypedResults.CreatedAtRoute(response, GetSetEndpoint.Name, new { setId });
    }
}

public class CreateSetRequest
{
    [FromBody]
    public CreateSetRequestPayload? Payload { get; init; }
}

public class CreateSetRequestPayload
{
    public List<string> WordIds { get; set; } = [];
}

public class CreateSetResponse
{
    public Guid SetId { get; init; }
}
