#pragma warning disable CA2252, OPENAI001

using System.ClientModel;
using Azure.AI.Projects;
using Azure.AI.Projects.OpenAI;
using Azure.Identity;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.Extensions.Options;
using OpenAI.Responses;

namespace LexicaNext.Infrastructure.Foundry;

internal interface IAzureFoundryAiClient
{
    Task<string?> CallAsync(string prompt, CancellationToken cancellationToken);
}

internal class AzureFoundryAiClient
    : IAzureFoundryAiClient, IScopedService
{
    private readonly ProjectResponsesClient _responsesClient;

    public AzureFoundryAiClient(IOptions<FoundryOptions> options)
    {
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

    public async Task<string?> CallAsync(string prompt, CancellationToken cancellationToken)
    {
        ClientResult<ResponseResult>? response =
            await _responsesClient.CreateResponseAsync(prompt, cancellationToken: cancellationToken);

        return response?.Value?.GetOutputText();
    }
}
