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
        request.Word = request.Word.Trim();
        request.WordType = request.WordType?.Trim();

        return request;
    }
}
