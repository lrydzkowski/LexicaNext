#pragma warning disable CA2252, OPENAI001

using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Services;

namespace LexicaNext.Infrastructure.Foundry;

internal class AzureFoundryAiService : IAiGenerationService, IScopedService
{
    private readonly IAzureFoundryAiClient _azureFoundryAiClient;
    private readonly ISerializer _serializer;

    public AzureFoundryAiService(IAzureFoundryAiClient azureFoundryAiClient, ISerializer serializer)
    {
        _azureFoundryAiClient = azureFoundryAiClient;
        _serializer = serializer;
    }

    public async Task<IReadOnlyList<GeneratedWord>> GenerateWordsAsync(
        int count,
        CancellationToken cancellationToken = default
    )
    {
        string prompt = $$"""
                          Generate {{count}} unique English vocabulary words suitable for language learning.

                          Requirements:
                          - Words should be at B1-C2 English level
                          - Each word must have a word type: Noun, Verb, Adjective, or Adverb
                          - Mix different word types roughly evenly
                          - No duplicate words
                          - Use common, practical vocabulary

                          Respond with valid JSON only. No markdown, no explanation, no code blocks.
                          Format: [{"word": "example", "wordType": "Noun"}, ...]
                          """;

        string response = await _azureFoundryAiClient.CallAsync(prompt, cancellationToken);

        return _serializer.Deserialize<List<GeneratedWord>>(response) ?? [];
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

        string response = await _azureFoundryAiClient.CallAsync(prompt, cancellationToken);

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

        string response = await _azureFoundryAiClient.CallAsync(prompt, cancellationToken);

        return _serializer.Deserialize<List<string>>(response) ?? [];
    }
}
