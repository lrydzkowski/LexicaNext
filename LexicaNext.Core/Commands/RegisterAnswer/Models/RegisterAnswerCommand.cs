namespace LexicaNext.Core.Commands.RegisterAnswer.Models;

public class RegisterAnswerCommand
{
    public string UserId { get; init; } = "";

    public string ModeType { get; init; } = "";

    public string QuestionType { get; init; } = "";

    public string Question { get; init; } = "";

    public string? GivenAnswer { get; init; }

    public string ExpectedAnswer { get; init; } = "";

    public bool IsCorrect { get; init; }
}
