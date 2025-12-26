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
using LexicaNext.Core.Queries.GetSet.Interfaces;
using LexicaNext.Core.Queries.GetSets.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class SetsRepository
    : IScopedService,
        IGetSetsRepository,
        IGetSetRepository,
        ICreateSetRepository,
        IDeleteSetRepository,
        IUpdateSetRepository
{
    private readonly IDateTimeOffsetProvider _dateTimeOffsetProvider;
    private readonly AppDbContext _dbContext;
    private readonly IWordTypesRepository _wordTypesRepository;

    public SetsRepository(
        AppDbContext dbContext,
        IWordTypesRepository wordTypesRepository,
        IDateTimeOffsetProvider dateTimeOffsetProvider
    )
    {
        _dbContext = dbContext;
        _wordTypesRepository = wordTypesRepository;
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
        await using IDbContextTransaction transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            SetEntity setEntity = await AddSetAsync(createSetCommand, cancellationToken);

            for (int i = 0; i < createSetCommand.Entries.Count; i++)
            {
                Entry entry = createSetCommand.Entries[i];
                Guid wordTypeId = await GetWordTypeIdAsync(entry, cancellationToken);
                WordEntity wordEntity = await AddWordAsync(entry, wordTypeId, i, setEntity, cancellationToken);

                for (int j = 0; j < entry.Translations.Count; j++)
                {
                    string translation = entry.Translations[j];
                    await AddTranslationAsync(translation, j, wordEntity, cancellationToken);
                }

                for (int j = 0; j < entry.ExampleSentences.Count; j++)
                {
                    ExampleSentence sentence = entry.ExampleSentences[j];
                    await AddExampleSentenceAsync(sentence.Sentence, j, wordEntity, cancellationToken);
                }
            }

            await transaction.CommitAsync(cancellationToken);

            return setEntity.SetId;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
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
                    Entries = setEntity.Words.OrderBy(x => x.Order)
                        .Select(
                            x => new Entry
                            {
                                Word = x.Word,
                                WordType = MapWordType(x.WordType!.Name),
                                Translations = x.Translations.OrderBy(t => t.Order).Select(y => y.Translation).ToList(),
                                ExampleSentences = x.ExampleSentences.OrderBy(s => s.Order)
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
        await using IDbContextTransaction transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            SetEntity? setEntity = await _dbContext.Sets
                .Include(setEntity => setEntity.Words)
                .FirstOrDefaultAsync(setEntity => setEntity.SetId == updateSetCommand.SetId, cancellationToken);
            if (setEntity == null)
            {
                return;
            }

            setEntity.Name = updateSetCommand.SetName;
            await _dbContext.SaveChangesAsync(cancellationToken);

            _dbContext.RemoveRange(setEntity.Words);
            await _dbContext.SaveChangesAsync(cancellationToken);

            for (int i = 0; i < updateSetCommand.Entries.Count; i++)
            {
                Entry entry = updateSetCommand.Entries[i];
                Guid wordTypeId = await GetWordTypeIdAsync(entry, cancellationToken);
                WordEntity wordEntity = await AddWordAsync(entry, wordTypeId, i, setEntity, cancellationToken);

                for (int j = 0; j < entry.Translations.Count; j++)
                {
                    string translation = entry.Translations[j];
                    await AddTranslationAsync(translation, j, wordEntity, cancellationToken);
                }

                for (int j = 0; j < entry.ExampleSentences.Count; j++)
                {
                    ExampleSentence sentence = entry.ExampleSentences[j];
                    await AddExampleSentenceAsync(sentence.Sentence, j, wordEntity, cancellationToken);
                }
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<bool> SetExistsAsync(Guid setId, CancellationToken cancellationToken = default)
    {
        bool setExists = await _dbContext.Sets.AsNoTracking()
            .Select(entity => entity.SetId)
            .AnyAsync(entrySetId => entrySetId == setId, cancellationToken);

        return setExists;
    }

    private async Task<SetEntity> AddSetAsync(
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
        await _dbContext.SaveChangesAsync(cancellationToken);

        return setEntity;
    }

    private async Task<Guid> GetWordTypeIdAsync(Entry entry, CancellationToken cancellationToken = default)
    {
        Guid? wordTypeId = await _wordTypesRepository.GetWordTypeIdAsync(entry.WordType, cancellationToken);
        if (wordTypeId is null)
        {
            throw new InvalidOperationException($"Word type = '{entry.WordType}' doesn't exist.");
        }

        return (Guid)wordTypeId;
    }

    private async Task<WordEntity> AddWordAsync(
        Entry entry,
        Guid wordTypeId,
        int order,
        SetEntity setEntity,
        CancellationToken cancellationToken = default
    )
    {
        WordEntity wordEntity = new()
        {
            WordId = Guid.CreateVersion7(),
            Word = entry.Word,
            WordTypeId = wordTypeId,
            Order = order,
            SetId = setEntity.SetId
        };
        await _dbContext.Words.AddAsync(wordEntity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return wordEntity;
    }

    private async Task<TranslationEntity> AddTranslationAsync(
        string translation,
        int order,
        WordEntity wordEntity,
        CancellationToken cancellationToken = default
    )
    {
        TranslationEntity translationEntity = new()
        {
            TranslationId = Guid.CreateVersion7(),
            Translation = translation,
            Order = order,
            WordId = wordEntity.WordId
        };
        await _dbContext.Translations.AddAsync(translationEntity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return translationEntity;
    }

    private async Task<ExampleSentenceEntity> AddExampleSentenceAsync(
        string sentence,
        int order,
        WordEntity wordEntity,
        CancellationToken cancellationToken = default
    )
    {
        ExampleSentenceEntity exampleSentenceEntity = new()
        {
            ExampleSentenceId = Guid.CreateVersion7(),
            Sentence = sentence,
            Order = order,
            WordId = wordEntity.WordId
        };
        await _dbContext.ExampleSentences.AddAsync(exampleSentenceEntity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return exampleSentenceEntity;
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }
}
