using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRecording.Interfaces;
using LexicaNext.Core.Queries.GetRecording.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetRecording;

public static class GetRecordingEndpoint
{
    public const string Name = "GetRecording";

    public static void MapGetRecordingEndpoint(this WebApplication app)
    {
        app.MapGet("/api/recordings/{word}", HandleAsync)
            .WithName(Name)
            .WithSummary("Return an audio recording for the pronunciation of the given word")
            .Produces<FileContentHttpResult>()
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization();
    }

    private static async Task<Results<ProblemHttpResult, FileContentHttpResult, NotFound>> HandleAsync(
        [AsParameters] GetRecordingRequest request,
        [FromServices] IGetRecordingRequestProcessor processor,
        [FromServices] IValidator<GetRecordingRequest> validator,
        [FromServices] IWordTypeMapper wordTypeMapper,
        [FromServices] IRecordingMetaData recordingMetaData,
        [FromServices] IRecordingStorage recordingStorage,
        [FromServices] IRecordingApi recordingApi,
        CancellationToken cancellationToken
    )
    {
        request = processor.Process(request);
        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        string word = request.Word;
        WordType wordType = wordTypeMapper.Map(request.WordType);

        string? fileName = await recordingMetaData.GetFileNameAsync(word, wordType, cancellationToken);
        if (fileName is not null)
        {
            byte[]? fileFromStorage = await recordingStorage.GetFileAsync(fileName, cancellationToken);
            if (fileFromStorage is not null)
            {
                return TypedResults.File(
                    fileFromStorage,
                    CustomMediaTypes.Audio.Mpeg,
                    GetUserFriendlyFileName(word)
                );
            }
        }

        byte[]? fileFromApi = await recordingApi.GetFileAsync(word, wordType, cancellationToken);
        if (fileFromApi is null)
        {
            return TypedResults.NotFound();
        }

        fileName = Guid.CreateVersion7().ToString();
        await recordingStorage.SaveFileAsync(fileName, fileFromApi);
        await recordingMetaData.AddFileNameAsync(word, wordType, fileName, cancellationToken);

        return TypedResults.File(fileFromApi, CustomMediaTypes.Audio.Mpeg, GetUserFriendlyFileName(word));
    }

    private static string GetUserFriendlyFileName(string word)
    {
        return $"{word}.mp3";
    }
}

public class GetRecordingRequest
{
    public string Word { get; set; } = "";

    [FromQuery(Name = "wordType")]
    public string? WordType { get; set; }
}
