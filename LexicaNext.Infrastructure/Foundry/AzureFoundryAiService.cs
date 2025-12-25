#pragma warning disable CA2252, OPENAI001

using System.ClientModel;
using Azure.AI.Projects;
using Azure.AI.Projects.OpenAI;
using Azure.Identity;
using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Services;
using Microsoft.Extensions.Options;
using OpenAI.Responses;

namespace LexicaNext.Infrastructure.Foundry;

internal class AzureFoundryAiService : IAiGenerationService, IScopedService
{
    private readonly ProjectResponsesClient _responsesClient;
    private readonly ISerializer _serializer;

    public AzureFoundryAiService(IOptions<FoundryOptions> options, ISerializer serializer)
    {
        _serializer = serializer;
        FoundryOptions foundryOptions = options.Value;

        ClientSecretCredential credential = new(
            foundryOptions.TenantId,
            foundryOptions.ClientId,
            foundryOptions.ClientSecret
        );
        AIProjectClient projectClient = new(
            new Uri(foundryOptions.ProjectEndpoint),
            credential
        );
        _responsesClient = projectClient.OpenAI.GetProjectResponsesClientForModel(foundryOptions.ModelDeploymentName);
    }

    public async Task<IReadOnlyList<string>> GenerateTranslationsAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    )
    {
        string prompt = $"""
                         You are a professional English-Polish translator. Translate the English word "{word}"
                         used as a {wordType} into Polish.

                         Return exactly {count} translations ordered from most commonly used to least commonly used.

                         Respond with valid JSON only. No markdown, no explanation, no code blocks.
                         Format: ["translation1", "translation2", "translation3"]
                         """;

        string response = await CallAiAsync(prompt, cancellationToken);

        return _serializer.Deserialize<List<string>>(response) ?? [];
    }

    public async Task<IReadOnlyList<string>> GenerateExampleSentencesAsync(
        string word,
        string wordType,
        int count,
        CancellationToken cancellationToken = default
    )
    {
        string prompt = $"""
                         Generate {count} example sentences in English using the word "{word}" as a {wordType}.

                         Requirements:
                         - Sentences must be at B1-B2 English level (intermediate complexity)
                         - Use common vocabulary and standard grammar structures
                         - Each sentence should be 10-20 words long
                         - Sentences should demonstrate different contexts/meanings

                         Respond with valid JSON only. No markdown, no explanation, no code blocks.
                         Format: ["Sentence one.", "Sentence two.", "Sentence three."]
                         """;

        string response = await CallAiAsync(prompt, cancellationToken);

        return _serializer.Deserialize<List<string>>(response) ?? [];
    }

    private async Task<string> CallAiAsync(string prompt, CancellationToken cancellationToken)
    {
        ClientResult<ResponseResult>? response =
            await _responsesClient.CreateResponseAsync(prompt, cancellationToken: cancellationToken);
        return response.Value.GetOutputText();
    }
}
