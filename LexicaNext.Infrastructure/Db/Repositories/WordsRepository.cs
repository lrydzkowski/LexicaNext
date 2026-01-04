using LexicaNext.Core.Commands.CreateWord.Interfaces;
using LexicaNext.Core.Commands.CreateWord.Models;
using LexicaNext.Core.Commands.DeleteWords.Interfaces;
using LexicaNext.Core.Commands.UpdateWord.Interfaces;
using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Infrastructure.Lists.Extensions;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;
using LexicaNext.Core.Queries.GetWords.Interfaces;
using LexicaNext.Core.Queries.GetWordSets.Interfaces;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class WordsRepository
    : IScopedService,
        ICreateWordRepository,
        IUpdateWordRepository,
        IDeleteWordsRepository,
        IGetWordRepository,
        IGetWordsRepository,
        IGetWordSetsRepository
{
    private readonly IDateTimeOffsetProvider _dateTimeOffsetProvider;
    private readonly AppDbContext _dbContext;
    private readonly IWordTypesRepository _wordTypesRepository;

    public WordsRepository(
        AppDbContext dbContext,
        IWordTypesRepository wordTypesRepository,
        IDateTimeOffsetProvider dateTimeOffsetProvider
    )
    {
        _dbContext = dbContext;
        _wordTypesRepository = wordTypesRepository;
        _dateTimeOffsetProvider = dateTimeOffsetProvider;
    }

    public async Task<Guid> CreateWordAsync(
        CreateWordCommand createWordCommand,
        CancellationToken cancellationToken = default
    )
    {
        await using IDbContextTransaction transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            Guid wordTypeId = await GetWordTypeIdAsync(createWordCommand.WordType, cancellationToken);
            WordEntity wordEntity = await AddWordAsync(createWordCommand, wordTypeId, cancellationToken);

            for (int i = 0; i < createWordCommand.Translations.Count; i++)
            {
                string translation = createWordCommand.Translations[i];
                await AddTranslationAsync(translation, i, wordEntity, cancellationToken);
            }

            for (int i = 0; i < createWordCommand.ExampleSentences.Count; i++)
            {
                ExampleSentence sentence = createWordCommand.ExampleSentences[i];
                await AddExampleSentenceAsync(sentence.Sentence, i, wordEntity, cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return wordEntity.WordId;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<bool> WordExistsAsync(string word, string wordType, CancellationToken cancellationToken = default)
    {
        bool wordExists = await _dbContext.Words.AsNoTracking()
            .Include(entity => entity.WordType)
            .AnyAsync(
                entity => entity.Word.ToLower() == word.ToLower()
                          && entity.WordType != null
                          && entity.WordType.Name.ToLower() == wordType.ToLower(),
                cancellationToken
            );

        return wordExists;
    }

    public async Task DeleteWordsAsync(List<Guid> wordIds, CancellationToken cancellationToken = default)
    {
        if (wordIds.Count == 0)
        {
            return;
        }

        await _dbContext.Words
            .Where(entity => wordIds.Contains(entity.WordId))
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task<Word?> GetWordAsync(Guid wordId, CancellationToken cancellationToken = default)
    {
        Word? word = await _dbContext.Words.AsNoTracking()
            .Where(entity => entity.WordId == wordId)
            .Select(
                entity => new Word
                {
                    WordId = entity.WordId,
                    Text = entity.Word,
                    WordType = MapWordType(entity.WordType!.Name),
                    CreatedAt = entity.CreatedAt,
                    EditedAt = entity.EditedAt,
                    Translations = entity.Translations.OrderBy(t => t.Order).Select(t => t.Translation).ToList(),
                    ExampleSentences = entity.ExampleSentences.OrderBy(s => s.Order)
                        .Select(s => new ExampleSentence { Sentence = s.Sentence, Order = s.Order })
                        .ToList()
                }
            )
            .FirstOrDefaultAsync(cancellationToken);

        return word;
    }

    public async Task<List<Guid>> GetExistingWordIdsAsync(
        List<Guid> wordIds,
        CancellationToken cancellationToken = default
    )
    {
        List<Guid> existingIds = await _dbContext.Words.AsNoTracking()
            .Where(entity => wordIds.Contains(entity.WordId))
            .Select(entity => entity.WordId)
            .ToListAsync(cancellationToken);

        return existingIds;
    }

    public async Task<List<SetRecord>> GetWordSetsAsync(Guid wordId, CancellationToken cancellationToken = default)
    {
        List<SetRecord> sets = await _dbContext.SetWords.AsNoTracking()
            .Where(entity => entity.WordId == wordId)
            .Select(
                entity => new SetRecord
                {
                    SetId = entity.Set!.SetId,
                    Name = entity.Set.Name,
                    CreatedAt = entity.Set.CreatedAt
                }
            )
            .ToListAsync(cancellationToken);

        return sets;
    }

    public async Task<ListInfo<WordRecord>> GetWordsAsync(
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    )
    {
        string defaultSortingFieldName = "createdAt";
        SortingOrder defaultSortingOrder = SortingOrder.Descending;
        List<string> fieldsAvailableToSort = ["wordId", "word", "createdAt", "editedAt"];
        List<string> fieldsAvailableToFilter = ["word"];

        IQueryable<WordEntity> query = _dbContext.Words.AsNoTracking()
            .Include(entity => entity.WordType)
            .Sort(fieldsAvailableToSort, listParameters.Sorting, defaultSortingFieldName, defaultSortingOrder)
            .Filter(fieldsAvailableToFilter, listParameters.Search);
        List<WordRecord> words = await query
            .Paginate(listParameters.Pagination)
            .Select(
                entity => new WordRecord
                {
                    WordId = entity.WordId,
                    Text = entity.Word,
                    WordType = MapWordType(entity.WordType!.Name),
                    CreatedAt = entity.CreatedAt,
                    EditedAt = entity.EditedAt
                }
            )
            .ToListAsync(cancellationToken);
        int count = await query.CountAsync(cancellationToken);

        return new ListInfo<WordRecord>
        {
            Data = words,
            Count = count
        };
    }

    public async Task<bool> WordExistsAsync(
        string word,
        string wordType,
        Guid ignoreWordId,
        CancellationToken cancellationToken = default
    )
    {
        bool wordExists = await _dbContext.Words.AsNoTracking()
            .Include(entity => entity.WordType)
            .AnyAsync(
                entity => entity.WordId != ignoreWordId
                          && entity.Word.ToLower() == word.ToLower()
                          && entity.WordType != null
                          && entity.WordType.Name.ToLower() == wordType.ToLower(),
                cancellationToken
            );

        return wordExists;
    }

    public async Task<bool> WordExistsAsync(Guid wordId, CancellationToken cancellationToken = default)
    {
        bool wordExists = await _dbContext.Words.AsNoTracking()
            .AnyAsync(entity => entity.WordId == wordId, cancellationToken);

        return wordExists;
    }

    public async Task UpdateWordAsync(
        UpdateWordCommand updateWordCommand,
        CancellationToken cancellationToken = default
    )
    {
        await using IDbContextTransaction transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            WordEntity? wordEntity = await _dbContext.Words
                .Include(entity => entity.Translations)
                .Include(entity => entity.ExampleSentences)
                .FirstOrDefaultAsync(entity => entity.WordId == updateWordCommand.WordId, cancellationToken);
            if (wordEntity == null)
            {
                return;
            }

            Guid wordTypeId = await GetWordTypeIdAsync(updateWordCommand.WordType, cancellationToken);

            wordEntity.Word = updateWordCommand.Word;
            wordEntity.WordTypeId = wordTypeId;
            wordEntity.EditedAt = _dateTimeOffsetProvider.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);

            _dbContext.RemoveRange(wordEntity.Translations);
            _dbContext.RemoveRange(wordEntity.ExampleSentences);
            await _dbContext.SaveChangesAsync(cancellationToken);

            for (int i = 0; i < updateWordCommand.Translations.Count; i++)
            {
                string translation = updateWordCommand.Translations[i];
                await AddTranslationAsync(translation, i, wordEntity, cancellationToken);
            }

            for (int i = 0; i < updateWordCommand.ExampleSentences.Count; i++)
            {
                ExampleSentence sentence = updateWordCommand.ExampleSentences[i];
                await AddExampleSentenceAsync(sentence.Sentence, i, wordEntity, cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task DeleteWordAsync(Guid wordId, CancellationToken cancellationToken = default)
    {
        await _dbContext.Words
            .Where(entity => entity.WordId == wordId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    private async Task<Guid> GetWordTypeIdAsync(WordType wordType, CancellationToken cancellationToken = default)
    {
        Guid? wordTypeId = await _wordTypesRepository.GetWordTypeIdAsync(wordType, cancellationToken);
        if (wordTypeId is null)
        {
            throw new InvalidOperationException($"Word type = '{wordType}' doesn't exist.");
        }

        return (Guid)wordTypeId;
    }

    private async Task<WordEntity> AddWordAsync(
        CreateWordCommand createWordCommand,
        Guid wordTypeId,
        CancellationToken cancellationToken = default
    )
    {
        WordEntity wordEntity = new()
        {
            WordId = Guid.CreateVersion7(),
            Word = createWordCommand.Word,
            WordTypeId = wordTypeId,
            CreatedAt = _dateTimeOffsetProvider.UtcNow
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
