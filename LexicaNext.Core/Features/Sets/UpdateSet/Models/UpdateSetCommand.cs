namespace LexicaNext.Core.Features.Sets.UpdateSet.Models;

public class UpdateSetCommand
{
    public Guid SetId { get; set; }

    public string UserId { get; set; } = "";

    public List<Guid> WordIds { get; set; } = [];
}
