using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRecording.Interfaces;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LexicaNext.Infrastructure.EnglishDictionary;

internal class EnglishDictionaryHealthCheck : IHealthCheck
{
    private readonly IRecordingApi _recordingApi;

    public EnglishDictionaryHealthCheck(IRecordingApi recordingApi)
    {
        _recordingApi = recordingApi;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = new()
    )
    {
        try
        {
            await _recordingApi.GetFileAsync("test", WordType.Noun, cancellationToken);

            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(exception: ex);
        }
    }
}
