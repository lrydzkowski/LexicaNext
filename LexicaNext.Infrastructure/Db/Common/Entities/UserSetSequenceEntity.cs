namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class UserSetSequenceEntity
{
    public const string TableName = "user_set_sequence";

    public Guid UserSetSequenceId { get; set; }

    public required string UserId { get; set; }

    public int NextValue { get; set; }

    public DateTimeOffset LastUpdated { get; set; }
}
