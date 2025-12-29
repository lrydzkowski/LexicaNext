namespace LexicaNext.Core.Commands.CreateSet.Models;

public class CreateSetCommand
{
    public string SetName { get; set; } = "";

    public List<Guid> WordIds { get; set; } = [];
}
