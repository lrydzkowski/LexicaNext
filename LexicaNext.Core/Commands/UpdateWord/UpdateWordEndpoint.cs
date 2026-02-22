using FluentValidation.Results;
using LexicaNext.Core.Commands.UpdateWord.Interfaces;
using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Commands.UpdateWord.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.UpdateWord;

public static class UpdateWordEndpoint
{
    public const string Name = "UpdateWord";

    public static void MapUpdateWordEndpoint(this WebApplication app)
    {
        app.MapPut("/api/words/{wordId}", HandleAsync)
            .WithName(Name)
            .WithSummary("Update an existing word")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, ProblemHttpResult, NoContent, UnauthorizedHttpResult>> HandleAsync(
        [AsParameters] UpdateWordRequest request,
        [FromServices] IUpdateWordRequestValidator validator,
        [FromServices] IUpdateWordCommandMapper updateWordCommandMapper,
        [FromServices] IUpdateWordRepository updateWordRepository,
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

        bool exists = await updateWordRepository.WordExistsAsync(userId, wordId, cancellationToken);
        if (!exists)
        {
            return TypedResults.NotFound();
        }

        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        UpdateWordCommand command = updateWordCommandMapper.Map(userId, request);
        await updateWordRepository.UpdateWordAsync(command, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class UpdateWordRequest
{
    public string WordId { get; set; } = "";

    [FromBody]
    public UpdateWordRequestPayload? Payload { get; init; }
}

public class UpdateWordRequestPayload
{
    public string Word { get; init; } = "";

    public string WordType { get; init; } = "";

    public List<string> Translations { get; set; } = [];

    public List<string> ExampleSentences { get; set; } = [];
}
