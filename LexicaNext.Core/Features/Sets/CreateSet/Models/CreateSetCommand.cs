namespace LexicaNext.Core.Features.Sets.CreateSet.Models;

public class CreateSetCommand
{
    public string UserId { get; set; } = "";

    public List<Guid> WordIds { get; set; } = [];
}
