namespace LexicaNext.Core.Commands.UpdateSet.Models;

public class UpdateSetCommand
{
    public Guid SetId { get; set; }

    public string UserId { get; set; } = "";

    public List<Guid> WordIds { get; set; } = [];
}
