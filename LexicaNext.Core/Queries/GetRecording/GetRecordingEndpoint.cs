using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRecording.Interfaces;
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
        app.MapGet("/recordings/{word}", HandleAsync).WithName(Name);
    }

    private static async Task<Results<FileContentHttpResult, NotFound>> HandleAsync(
        GetRecordingRequest request,
        IWordTypeMapper wordTypeMapper,
        IRecordingMetaData recordingMetaData,
        IRecordingStorage recordingStorage,
        IRecordingApi recordingApi,
        CancellationToken cancellationToken
    )
    {
        string word = request.Word.Trim();
        WordType wordType = wordTypeMapper.Map(word);

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
    public string Word { get; init; } = "";

    [FromQuery(Name = "wordType")]
    public string? WordType { get; init; }
}
