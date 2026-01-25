namespace LexicaNext.Core.Commands.CreateSet.Models;

public class CreateSetCommand
{
    public string UserId { get; set; } = "";

    public List<Guid> WordIds { get; set; } = [];
}
