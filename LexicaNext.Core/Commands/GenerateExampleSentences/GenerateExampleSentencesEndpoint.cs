using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
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

    private static async Task<GenerateExampleSentencesResponse> HandleAsync(
        [FromBody] GenerateExampleSentencesRequest request,
        [FromServices] IAiGenerationService aiGenerationService,
        CancellationToken cancellationToken
    )
    {
        IReadOnlyList<string> sentences = await aiGenerationService.GenerateExampleSentencesAsync(
            request.Word,
            request.WordType,
            request.Count,
            cancellationToken
        );

        return new GenerateExampleSentencesResponse(sentences);
    }
}

public record GenerateExampleSentencesRequest(string Word, string WordType, int Count = 3);

public record GenerateExampleSentencesResponse(IReadOnlyList<string> Sentences);
