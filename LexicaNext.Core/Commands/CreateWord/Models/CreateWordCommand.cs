using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateWord.Models;

public class CreateWordCommand
{
    public string Word { get; set; } = "";

    public WordType WordType { get; set; } = WordType.None;

    public List<string> Translations { get; set; } = [];

    public List<ExampleSentence> ExampleSentences { get; set; } = [];
}
