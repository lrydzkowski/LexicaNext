namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class WordTypeEntity
{
    public const string TableName = "word_type";

    public Guid WordTypeId { get; set; }

    public string Name { get; set; } = "";

    public ICollection<WordEntity> Words { get; set; } = [];

    public ICollection<RecordingEntity> Recordings { get; set; } = [];
}
