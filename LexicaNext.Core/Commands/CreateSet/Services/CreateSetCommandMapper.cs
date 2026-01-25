using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.CreateSet.Services;

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
            SetName = request.Payload?.SetName?.Trim() ?? "",
            WordIds = request.Payload?.WordIds
                          .Where(id => Guid.TryParse(id, out _))
                          .Select(Guid.Parse)
                          .ToList()
                      ?? []
        };
    }
}
