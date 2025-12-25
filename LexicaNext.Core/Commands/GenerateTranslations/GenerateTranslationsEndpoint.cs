using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Auth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.GenerateTranslations;

public static class GenerateTranslationsEndpoint
{
    public const string Name = "GenerateTranslations";

    public static void MapGenerateTranslationsEndpoint(this WebApplication app)
    {
        app.MapPost("/api/translations/generate", HandleAsync)
            .WithName(Name)
            .WithSummary("Generate Polish translations for an English word using AI")
            .Produces<GenerateTranslationsResponse>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<GenerateTranslationsResponse> HandleAsync(
        [FromBody] GenerateTranslationsRequest request,
        [FromServices] IAiGenerationService aiGenerationService,
        CancellationToken cancellationToken
    )
    {
        IReadOnlyList<string> translations = await aiGenerationService.GenerateTranslationsAsync(
            request.Word,
            request.WordType,
            request.Count,
            cancellationToken
        );

        return new GenerateTranslationsResponse(translations);
    }
}

public record GenerateTranslationsRequest(string Word, string WordType, int Count = 3);

public record GenerateTranslationsResponse(IReadOnlyList<string> Translations);
