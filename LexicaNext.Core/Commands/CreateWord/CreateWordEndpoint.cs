using FluentValidation.Results;
using LexicaNext.Core.Commands.CreateWord.Interfaces;
using LexicaNext.Core.Commands.CreateWord.Models;
using LexicaNext.Core.Commands.CreateWord.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.CreateWord;

public static class CreateWordEndpoint
{
    public const string Name = "CreateWord";

    public static void MapCreateWordEndpoint(this WebApplication app)
    {
        app.MapPost("/api/words", HandleAsync)
            .WithName(Name)
            .WithSummary("Create a new word")
            .Produces<CreateWordResponse>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, Created<CreateWordResponse>, UnauthorizedHttpResult>>
        HandleAsync(
            [AsParameters] CreateWordRequest request,
            [FromServices] ICreateWordRequestValidator validator,
            [FromServices] ICreateWordCommandMapper createWordCommandMapper,
            [FromServices] ICreateWordRepository createWordRepository,
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

        CreateWordCommand command = createWordCommandMapper.Map(userId, request);
        Guid wordId = await createWordRepository.CreateWordAsync(command, cancellationToken);
        CreateWordResponse response = new()
        {
            WordId = wordId
        };

        return TypedResults.Created($"/api/words/{wordId}", response);
    }
}

public class CreateWordRequest
{
    [FromBody]
    public CreateWordRequestPayload? Payload { get; init; }
}

public class CreateWordRequestPayload
{
    public string Word { get; init; } = "";

    public string WordType { get; init; } = "";

    public List<string> Translations { get; set; } = [];

    public List<string> ExampleSentences { get; set; } = [];
}

public class CreateWordResponse
{
    public Guid WordId { get; init; }
}
