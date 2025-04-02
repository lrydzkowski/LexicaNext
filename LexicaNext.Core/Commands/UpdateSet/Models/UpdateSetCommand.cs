using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateSet.Models;

public class UpdateSetCommand
{
    public Guid SetId { get; set; }

    public string SetName { get; set; } = "";

    public List<Entry> Entries { get; set; } = [];
}
