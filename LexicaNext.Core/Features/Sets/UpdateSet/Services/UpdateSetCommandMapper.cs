using LexicaNext.Core.Features.Sets.UpdateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Features.Sets.UpdateSet.Services;

public interface IUpdateSetCommandMapper
{
    UpdateSetCommand Map(string userId, UpdateSetRequest request);
}

internal class UpdateSetCommandMapper
    : ISingletonService, IUpdateSetCommandMapper
{
    public UpdateSetCommand Map(string userId, UpdateSetRequest request)
    {
        return new UpdateSetCommand
        {
            SetId = Guid.Parse(request.SetId),
            UserId = userId,
            WordIds = request.Payload?.WordIds
                          .Where(id => Guid.TryParse(id, out _))
                          .Select(Guid.Parse)
                          .ToList()
                      ?? []
        };
    }
}
