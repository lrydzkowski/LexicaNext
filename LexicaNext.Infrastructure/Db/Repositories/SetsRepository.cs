using System.Text.RegularExpressions;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.DeleteSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Lists.Extensions;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetProposedSetName.Interfaces;
using LexicaNext.Core.Queries.GetSet.Interfaces;
using LexicaNext.Core.Queries.GetSets.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class SetsRepository
    : IScopedService,
        IGetSetsRepository,
        IGetSetRepository,
        ICreateSetRepository,
        IDeleteSetRepository,
        IUpdateSetRepository,
        IGetProposedSetNameRepository
{
    private readonly IDateTimeOffsetProvider _dateTimeOffsetProvider;
    private readonly AppDbContext _dbContext;

    public SetsRepository(
        AppDbContext dbContext,
        IDateTimeOffsetProvider dateTimeOffsetProvider
    )
    {
        _dbContext = dbContext;
        _dateTimeOffsetProvider = dateTimeOffsetProvider;
    }

    public async Task<bool> SetExistsAsync(
        string setName,
        Guid? ignoreSetId,
        CancellationToken cancellationToken = default
    )
    {
        bool setExists = await _dbContext.Sets.AsNoTracking()
            .Where(
                entity => entity.Name.ToLower() == setName.ToLower()
                          && (ignoreSetId == null || entity.SetId != ignoreSetId)
            )
            .Select(entity => entity.Name)
            .AnyAsync(cancellationToken);

        return setExists;
    }

    public async Task<Guid> CreateSetAsync(
        CreateSetCommand createSetCommand,
        CancellationToken cancellationToken = default
    )
    {
        SetEntity setEntity = new()
        {
            SetId = Guid.CreateVersion7(),
            Name = createSetCommand.SetName,
            CreatedAt = _dateTimeOffsetProvider.UtcNow
        };
        await _dbContext.Sets.AddAsync(setEntity, cancellationToken);

        List<SetWordEntity> setWordEntities = createSetCommand.WordIds
            .Select(
                (wordId, index) => new SetWordEntity
                {
                    SetId = setEntity.SetId,
                    WordId = wordId,
                    Order = index
                }
            )
            .ToList();
        await _dbContext.SetWords.AddRangeAsync(setWordEntities, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        await UpdateSequenceIfMatchesPatternAsync(createSetCommand.SetName, cancellationToken);

        return setEntity.SetId;
    }

    public async Task DeleteSetAsync(Guid setId, CancellationToken cancellationToken = default)
    {
        if (!await SetExistsAsync(setId, cancellationToken))
        {
            return;
        }

        SetEntity setEntity = new() { SetId = setId };
        _dbContext.Entry(setEntity).State = EntityState.Deleted;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<string> GetProposedSetNameAsync(CancellationToken cancellationToken = default)
    {
        long nextValue = await _dbContext.Database
            .SqlQuery<long>($"SELECT COALESCE(last_value, 0) AS \"Value\" FROM set_name_sequence")
            .FirstAsync(cancellationToken);

        return $"set_{nextValue:D4}";
    }

    public async Task<Set?> GetSetAsync(Guid setId, CancellationToken cancellationToken = default)
    {
        Set? set = await _dbContext.Sets.AsNoTracking()
            .Where(setEntity => setEntity.SetId == setId)
            .Select(
                setEntity => new Set
                {
                    SetId = setEntity.SetId,
                    Name = setEntity.Name,
                    CreatedAt = setEntity.CreatedAt,
                    Entries = setEntity.SetWords.OrderBy(sw => sw.Order)
                        .Select(
                            sw => new Entry
                            {
                                WordId = sw.Word!.WordId,
                                Word = sw.Word.Word,
                                WordType = MapWordType(sw.Word.WordType!.Name),
                                Translations = sw.Word.Translations.OrderBy(t => t.Order)
                                    .Select(y => y.Translation)
                                    .ToList(),
                                ExampleSentences = sw.Word.ExampleSentences.OrderBy(s => s.Order)
                                    .Select(s => new ExampleSentence { Sentence = s.Sentence, Order = s.Order })
                                    .ToList()
                            }
                        )
                        .ToList()
                }
            )
            .FirstOrDefaultAsync(cancellationToken);

        return set;
    }

    public async Task<ListInfo<SetRecord>> GetSetsAsync(
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    )
    {
        string defaultSortingFieldName = "setId";
        SortingOrder defaultSortingOrder = SortingOrder.Descending;
        List<string> fieldsAvailableToSort = ["setId", "name", "createdAt"];
        List<string> fieldsAvailableToFilter = ["name", "createdAt"];

        IQueryable<SetEntity> query = _dbContext.Sets.AsNoTracking()
            .Sort(fieldsAvailableToSort, listParameters.Sorting, defaultSortingFieldName, defaultSortingOrder)
            .Filter(fieldsAvailableToFilter, listParameters.Search);
        List<SetRecord> sets = await query
            .Paginate(listParameters.Pagination)
            .Select(
                setEntity => new SetRecord
                {
                    SetId = setEntity.SetId,
                    Name = setEntity.Name,
                    CreatedAt = setEntity.CreatedAt
                }
            )
            .ToListAsync(cancellationToken);
        int count = await query
            .Select(
                setEntity => setEntity.SetId!
            )
            .CountAsync(cancellationToken);

        return new ListInfo<SetRecord>
        {
            Data = sets,
            Count = count
        };
    }

    public async Task UpdateSetAsync(UpdateSetCommand updateSetCommand, CancellationToken cancellationToken = default)
    {
        SetEntity? setEntity = await _dbContext.Sets
            .Include(s => s.SetWords)
            .FirstOrDefaultAsync(s => s.SetId == updateSetCommand.SetId, cancellationToken);
        if (setEntity == null)
        {
            return;
        }

        setEntity.Name = updateSetCommand.SetName;

        _dbContext.RemoveRange(setEntity.SetWords);

        List<SetWordEntity> setWordEntities = updateSetCommand.WordIds
            .Select(
                (wordId, index) => new SetWordEntity
                {
                    SetId = setEntity.SetId,
                    WordId = wordId,
                    Order = index
                }
            )
            .ToList();
        await _dbContext.SetWords.AddRangeAsync(setWordEntities, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> SetExistsAsync(Guid setId, CancellationToken cancellationToken = default)
    {
        bool setExists = await _dbContext.Sets.AsNoTracking()
            .Select(entity => entity.SetId)
            .AnyAsync(entrySetId => entrySetId == setId, cancellationToken);

        return setExists;
    }

    private async Task UpdateSequenceIfMatchesPatternAsync(string setName, CancellationToken cancellationToken)
    {
        Match match = Regex.Match(setName, @"^set_(\d+)$", RegexOptions.IgnoreCase);
        if (!match.Success)
        {
            return;
        }

        if (!long.TryParse(match.Groups[1].Value, out long extractedNumber))
        {
            return;
        }

        long currentSequenceValue = await _dbContext.Database
            .SqlQuery<long>($"SELECT last_value AS \"Value\" FROM set_name_sequence")
            .FirstAsync(cancellationToken);

        if (extractedNumber >= currentSequenceValue)
        {
            long newValue = extractedNumber + 1;
            await _dbContext.Database
                .ExecuteSqlAsync($"SELECT setval('set_name_sequence', {newValue})", cancellationToken);
        }
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }
}
