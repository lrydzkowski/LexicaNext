namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class RecordingEntity
{
    public const string TableName = "recording";

    public Guid RecordingId { get; set; }

    public string Word { get; set; } = "";

    public Guid WordTypeId { get; set; }

    public WordTypeEntity? WordType { get; set; }

    public string FileName { get; set; } = "";
}
