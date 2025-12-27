using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.GenerateExampleSentences;

public static class GenerateExampleSentencesEndpoint
{
    public const string Name = "GenerateExampleSentences";

    public static void MapGenerateExampleSentencesEndpoint(this WebApplication app)
    {
        app.MapPost("/api/sentences/generate", HandleAsync)
            .WithName(Name)
            .WithSummary("Generate example sentences for an English word using AI")
            .Produces<GenerateExampleSentencesResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, Ok<GenerateExampleSentencesResponse>>> HandleAsync(
        [FromBody] GenerateExampleSentencesRequest request,
        [FromServices] IAiGenerationService aiGenerationService,
        [FromServices] IValidator<GenerateExampleSentencesRequest> validator,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        IReadOnlyList<string> sentences = await aiGenerationService.GenerateExampleSentencesAsync(
            request.Word,
            request.WordType,
            request.Count,
            cancellationToken
        );

        return TypedResults.Ok(new GenerateExampleSentencesResponse(sentences));
    }
}

public record GenerateExampleSentencesRequest(string Word, string WordType, int Count = 3);

public record GenerateExampleSentencesResponse(IReadOnlyList<string> Sentences);
