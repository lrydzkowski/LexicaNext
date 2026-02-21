using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Recordings.GetRecording.Data.CorrectTestCases;

// Cached recording: DB has metadata, storage returns bytes. Expected: 200 OK, audio/mpeg.
internal static class TestCase01
{
    private static readonly Guid RecordingId = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");
    private const string FileName = "cached-recording-file";
    private static readonly byte[] AudioBytes = [0xFF, 0xFB, 0x90, 0x00, 0x01, 0x02, 0x03, 0x04];

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Word = "apple",
            WordType = "noun",
            Data = new BaseTestCaseData
            {
                RecordingStorage = new RecordingStorageTestCaseData
                {
                    Files = new Dictionary<string, byte[]?>
                    {
                        [FileName] = AudioBytes
                    }
                },
                Db = new DbTestCaseData
                {
                    Recordings =
                    [
                        new RecordingEntity
                        {
                            RecordingId = RecordingId,
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            FileName = FileName
                        }
                    ]
                }
            }
        };
    }
}
