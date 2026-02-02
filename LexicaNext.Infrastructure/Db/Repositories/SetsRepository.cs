using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.DeleteSets.Interfaces;
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
        IDeleteSetsRepository,
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
        string userId,
        string setName,
        Guid? ignoreSetId,
        CancellationToken cancellationToken = default
    )
    {
        bool setExists = await _dbContext.Sets.AsNoTracking()
            .Where(
                entity => entity.Name.ToLower() == setName.ToLower()
                          && (ignoreSetId == null || entity.SetId != ignoreSetId)
                          && entity.UserId == userId
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
        UserSetSequenceEntity sequenceEntity =
            await GetOrCreateSequenceAsync(createSetCommand.UserId, cancellationToken);
        SetEntity setEntity = new()
        {
            SetId = Guid.CreateVersion7(),
            UserId = createSetCommand.UserId,
            Name = BuildSetName(sequenceEntity),
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

        sequenceEntity.NextValue++;
        if (sequenceEntity.NextValue > 999999)
        {
            sequenceEntity.NextValue = 1;
        }

        sequenceEntity.LastUpdated = _dateTimeOffsetProvider.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return setEntity.SetId;
    }

    public async Task DeleteSetsAsync(string userId, List<Guid> setIds, CancellationToken cancellationToken = default)
    {
        if (setIds.Count == 0)
        {
            return;
        }

        await _dbContext.Sets
            .Where(entity => setIds.Contains(entity.SetId) && entity.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task<string> GetProposedSetNameAsync(string userId, CancellationToken cancellationToken = default)
    {
        UserSetSequenceEntity sequenceEntity = await GetOrCreateSequenceAsync(userId, cancellationToken);
        string sequence = BuildSetName(sequenceEntity);

        return sequence;
    }

    public async Task<Set?> GetSetAsync(string userId, Guid setId, CancellationToken cancellationToken = default)
    {
        Set? set = await _dbContext.Sets.AsNoTracking()
            .Where(setEntity => setEntity.SetId == setId && setEntity.UserId == userId)
            .Select(
                setEntity => new Set
                {
                    SetId = setEntity.SetId,
                    UserId = setEntity.UserId,
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
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    )
    {
        string defaultSortingFieldName = "setId";
        SortingOrder defaultSortingOrder = SortingOrder.Descending;
        List<string> fieldsAvailableToSort = ["setId", "name", "createdAt"];
        List<string> fieldsAvailableToFilter = ["name", "createdAt"];

        IQueryable<SetEntity> query = _dbContext.Sets.AsNoTracking()
            .Where(entity => entity.UserId == userId)
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
            .FirstOrDefaultAsync(
                s => s.SetId == updateSetCommand.SetId && s.UserId == updateSetCommand.UserId,
                cancellationToken
            );
        if (setEntity == null)
        {
            return;
        }

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

        setEntity.UpdatedAt = _dateTimeOffsetProvider.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> SetExistsAsync(string userId, Guid setId, CancellationToken cancellationToken = default)
    {
        bool setExists = await _dbContext.Sets.AsNoTracking()
            .Where(entity => entity.SetId == setId && entity.UserId == userId)
            .Select(entity => entity.SetId)
            .AnyAsync(cancellationToken);

        return setExists;
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }

    private async Task<UserSetSequenceEntity> GetOrCreateSequenceAsync(
        string userId,
        CancellationToken cancellationToken
    )
    {
        UserSetSequenceEntity? sequence = await _dbContext.UserSetSequences
            .FirstOrDefaultAsync(entity => entity.UserId == userId, cancellationToken);
        if (sequence != null)
        {
            return sequence;
        }

        sequence = new UserSetSequenceEntity
        {
            UserSetSequenceId = Guid.CreateVersion7(),
            UserId = userId,
            NextValue = 1,
            LastUpdated = _dateTimeOffsetProvider.UtcNow
        };
        await _dbContext.UserSetSequences.AddAsync(sequence, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return sequence;
    }

    private string BuildSetName(UserSetSequenceEntity sequenceEntity)
    {
        return $"set_{sequenceEntity.NextValue:D6}";
    }
}
