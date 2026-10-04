using LexicaNext.Core.Features.Sets.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Features.Sets.CreateSet.Services;

public interface ICreateSetCommandMapper
{
    CreateSetCommand Map(string userId, CreateSetRequest request);
}

internal class CreateSetCommandMapper
    : ISingletonService, ICreateSetCommandMapper
{
    public CreateSetCommand Map(string userId, CreateSetRequest request)
    {
        return new CreateSetCommand
        {
            UserId = userId,
            WordIds = request.Payload?.WordIds
                          .Where(id => Guid.TryParse(id, out _))
                          .Select(Guid.Parse)
                          .ToList()
                      ?? []
        };
    }
}
