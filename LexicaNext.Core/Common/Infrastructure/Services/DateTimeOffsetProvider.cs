namespace LexicaNext.Core.Common.Infrastructure.Services;

public interface IDateTimeOffsetProvider
{
    DateTimeOffset UtcNow { get; }
}

public class DateTimeOffsetProvider : IDateTimeOffsetProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
