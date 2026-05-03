using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.DeleteSets.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetProposedSetName.Interfaces;
using LexicaNext.Core.Queries.GetSet.Interfaces;
using LexicaNext.Core.Queries.GetSets.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.Infrastructure.Db.Extensions;
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
        await EnsureSequenceExistsAsync(createSetCommand.UserId, cancellationToken);
        int reservedValue = await ReserveNextSequenceValueAsync(createSetCommand.UserId, cancellationToken);

        SetEntity setEntity = new()
        {
            SetId = Guid.CreateVersion7(),
            UserId = createSetCommand.UserId,
            Name = BuildSetName(reservedValue),
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
        int? nextValue = await _dbContext.UserSetSequences.AsNoTracking()
            .Where(entity => entity.UserId == userId)
            .Select(entity => (int?)entity.NextValue)
            .FirstOrDefaultAsync(cancellationToken);

        return BuildSetName(nextValue);
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

    private async Task EnsureSequenceExistsAsync(string userId, CancellationToken cancellationToken)
    {
        DateTimeOffset now = _dateTimeOffsetProvider.UtcNow;
        await _dbContext.Database.ExecuteSqlInterpolatedAsync(
            $@"INSERT INTO user_set_sequence (user_set_sequence_id, user_id, next_value, last_updated)
               VALUES ({Guid.CreateVersion7()}, {userId}, 1, {now})
               ON CONFLICT (user_id) DO NOTHING",
            cancellationToken
        );
    }

    private async Task<int> ReserveNextSequenceValueAsync(string userId, CancellationToken cancellationToken)
    {
        DateTimeOffset now = _dateTimeOffsetProvider.UtcNow;
        List<int> reserved = await _dbContext.Database
            .SqlQuery<int>(
                $@"WITH old AS (
                       SELECT user_id, next_value
                       FROM user_set_sequence
                       WHERE user_id = {userId}
                       FOR UPDATE
                   )
                   UPDATE user_set_sequence s
                   SET next_value = CASE WHEN old.next_value >= 999999 THEN 1 ELSE old.next_value + 1 END,
                       last_updated = {now}
                   FROM old
                   WHERE s.user_id = old.user_id
                   RETURNING old.next_value AS ""Value"""
            )
            .ToListAsync(cancellationToken);

        if (reserved.Count == 0)
        {
            throw new InvalidOperationException($"Failed to reserve set name sequence value for user '{userId}'.");
        }

        return reserved[0];
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }

    private static string BuildSetName(int? nextValue)
    {
        return $"set_{nextValue ?? 1:D6}";
    }
}
