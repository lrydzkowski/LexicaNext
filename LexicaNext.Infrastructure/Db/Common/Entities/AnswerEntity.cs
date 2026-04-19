namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class AnswerEntity
{
    public const string TableName = "answer";

    public Guid AnswerId { get; set; }

    public string UserId { get; set; } = "";

    public string ModeType { get; set; } = "";

    public string QuestionType { get; set; } = "";

    public string Question { get; set; } = "";

    public string? GivenAnswer { get; set; }

    public string ExpectedAnswer { get; set; } = "";

    public bool IsCorrect { get; set; }

    public DateTimeOffset AnsweredAt { get; set; }
}
