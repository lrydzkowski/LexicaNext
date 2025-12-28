using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.CreateSet.Services;

public interface ICreateSetCommandMapper
{
    CreateSetCommand Map(CreateSetRequest request);
}

internal class CreateSetCommandMapper
    : ISingletonService, ICreateSetCommandMapper
{
    public CreateSetCommand Map(CreateSetRequest request)
    {
        return new CreateSetCommand
        {
            SetName = request.Payload?.SetName?.Trim() ?? "",
            WordIds = request.Payload?.WordIds
                .Where(id => Guid.TryParse(id, out _))
                .Select(Guid.Parse)
                .ToList() ?? []
        };
    }
}
