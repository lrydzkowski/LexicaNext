namespace LexicaNext.Core.Commands.RegisterAnswer.Models;

public class RegisterAnswerCommand
{
    public string Question { get; init; } = "";

    public string? GivenAnswer { get; init; }

    public string ExpectedAnswer { get; init; } = "";
}
