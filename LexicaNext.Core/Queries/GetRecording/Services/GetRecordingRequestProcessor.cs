using System.Text.RegularExpressions;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Queries.GetRecording.Services;

internal interface IGetRecordingRequestProcessor
{
    GetRecordingRequest Process(GetRecordingRequest request);
}

internal class GetRecordingRequestProcessor
    : IGetRecordingRequestProcessor, ISingletonService
{
    public GetRecordingRequest Process(GetRecordingRequest request)
    {
        request.Word = SanitizeWord(request.Word);
        request.WordType = request.WordType?.Trim();

        return request;
    }

    private static string SanitizeWord(string word)
    {
        return Regex.Replace(word, "[^a-zA-Z0-9_ ]", "").Trim();
    }
}
