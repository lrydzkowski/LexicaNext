using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Models;

public class UpdateWordCommand
{
    public Guid WordId { get; set; }

    public string Word { get; set; } = "";

    public WordType WordType { get; set; } = WordType.None;

    public List<string> Translations { get; set; } = [];

    public List<ExampleSentence> ExampleSentences { get; set; } = [];
}
