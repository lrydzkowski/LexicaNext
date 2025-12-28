using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

public interface IUpdateSetCommandMapper
{
    UpdateSetCommand Map(UpdateSetRequest request);
}

internal class UpdateSetCommandMapper
    : ISingletonService, IUpdateSetCommandMapper
{
    public UpdateSetCommand Map(UpdateSetRequest request)
    {
        return new UpdateSetCommand
        {
            SetId = Guid.Parse(request.SetId),
            SetName = request.Payload?.SetName.Trim() ?? "",
            WordIds = request.Payload?.WordIds
                .Where(id => Guid.TryParse(id, out _))
                .Select(Guid.Parse)
                .ToList() ?? []
        };
    }
}
