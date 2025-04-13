using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetSets.Services;

public interface ISetRecordMapper
{
    ListInfo<SetRecordDto> Map(ListInfo<SetRecord> listInfo);

    List<SetRecordDto> Map(List<SetRecord> setRecords);

    SetRecordDto Map(SetRecord record);
}

internal class SetRecordMapper
    : ISingletonService, ISetRecordMapper
{
    public ListInfo<SetRecordDto> Map(ListInfo<SetRecord> listInfo)
    {
        return new ListInfo<SetRecordDto>
        {
            Count = listInfo.Count,
            Data = Map(listInfo.Data)
        };
    }

    public List<SetRecordDto> Map(List<SetRecord> setRecords)
    {
        return setRecords.Select(Map).ToList();
    }

    public SetRecordDto Map(SetRecord record)
    {
        return new SetRecordDto
        {
            SetId = record.SetId,
            Name = record.Name,
            CreatedAt = record.CreatedAt
        };
    }
}
