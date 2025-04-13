using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateSet.Models;

public class CreateSetCommand
{
    public string SetName { get; set; } = "";

    public List<Entry> Entries { get; set; } = [];
}
