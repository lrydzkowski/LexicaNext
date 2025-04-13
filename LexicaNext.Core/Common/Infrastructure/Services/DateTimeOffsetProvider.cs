using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Common.Infrastructure.Services;

public interface IDateTimeOffsetProvider
{
    DateTimeOffset UtcNow { get; }
}

public class DateTimeOffsetProvider : ISingletonService, IDateTimeOffsetProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
