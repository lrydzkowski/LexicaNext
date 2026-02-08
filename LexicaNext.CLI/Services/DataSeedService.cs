using Bogus;
using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LexicaNext.CLI.Services;

internal interface IDataSeedService
{
    Task SeedSetsAsync(string userId, int count = 10);

    Task ClearAllDataAsync();
}

internal class DataSeedService : IDataSeedService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DataSeedService> _logger;

    public DataSeedService(AppDbContext context, ILogger<DataSeedService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedSetsAsync(string userId, int count = 10)
    {
        UserSetSequenceEntity sequenceEntity = await GetOrCreateSequenceAsync(userId);

        Faker faker = new();
        List<DateTimeOffset> dates = Enumerable.Range(0, count)
            .Select(_ => faker.Date.PastOffset(365).ToUniversalTime())
            .OrderBy(d => d)
            .ToList();

        List<SetEntity> sets = [];
        for (int i = 0; i < count; i++)
        {
            string name = $"set_{sequenceEntity.NextValue:D6}";
            sets.Add(
                new SetEntity
                {
                    SetId = Guid.CreateVersion7(),
                    UserId = userId,
                    Name = name,
                    CreatedAt = dates[i]
                }
            );

            sequenceEntity.NextValue++;
            if (sequenceEntity.NextValue > 999999)
            {
                sequenceEntity.NextValue = 1;
            }
        }

        sequenceEntity.LastUpdated = DateTimeOffset.UtcNow;

        _context.Set<SetEntity>().AddRange(sets);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} sets", sets.Count);

        foreach (SetEntity set in sets)
        {
            await SeedWordsForSetAsync(userId, set.SetId, Randomizer.Seed.Next(5, 25));
        }
    }

    public async Task ClearAllDataAsync()
    {
        await _context.Set<ExampleSentenceEntity>().ExecuteDeleteAsync();
        await _context.Set<SetWordEntity>().ExecuteDeleteAsync();
        await _context.Set<TranslationEntity>().ExecuteDeleteAsync();
        await _context.Set<RecordingEntity>().ExecuteDeleteAsync();
        await _context.Set<WordEntity>().ExecuteDeleteAsync();
        await _context.Set<SetEntity>().ExecuteDeleteAsync();
        await _context.Set<AnswerEntity>().ExecuteDeleteAsync();
        await _context.Set<UserSetSequenceEntity>().ExecuteDeleteAsync();

        _logger.LogInformation("Cleared all data from database");
    }

    private async Task SeedWordsForSetAsync(string userId, Guid setId, int count)
    {
        List<WordTypeEntity> wordTypes = await _context.Set<WordTypeEntity>().ToListAsync();
        if (wordTypes.Count == 0)
        {
            _logger.LogError("No word types found in database. Run EF Core migrations to seed word types");

            return;
        }

        HashSet<(string Word, Guid WordTypeId)> existingWords = (await _context.Set<WordEntity>()
                .Where(w => w.UserId == userId)
                .Select(w => new { w.Word, w.WordTypeId })
                .ToListAsync())
            .Select(w => (w.Word.ToLower(), w.WordTypeId))
            .ToHashSet();

        List<WordEntity> words = new();
        int attempts = 0;
        int maxAttempts = count * 10;
        Faker faker = new();

        while (words.Count < count && attempts < maxAttempts)
        {
            attempts++;

            string word = faker.Lorem.Word();
            Guid wordTypeId = faker.PickRandom(wordTypes).WordTypeId;
            (string, Guid wordTypeId) key = (word.ToLower(), wordTypeId);

            if (!existingWords.Add(key))
            {
                continue;
            }

            words.Add(
                new WordEntity
                {
                    WordId = Guid.NewGuid(),
                    UserId = userId,
                    Word = word,
                    WordTypeId = wordTypeId,
                    CreatedAt = faker.Date.PastOffset(365).ToUniversalTime()
                }
            );
        }

        if (words.Count < count)
        {
            _logger.LogWarning(
                "Could only generate {ActualCount} unique words out of {RequestedCount} for set {SetId} after {Attempts} attempts",
                words.Count,
                count,
                setId,
                attempts
            );
        }

        _context.Set<WordEntity>().AddRange(words);
        await _context.SaveChangesAsync();

        for (int i = 0; i < words.Count; i++)
        {
            WordEntity word = words[i];
            SetWordEntity setWord = new()
            {
                SetId = setId,
                WordId = word.WordId,
                Order = i
            };
            _context.Set<SetWordEntity>().Add(setWord);
            await SeedTranslationsForWordAsync(word.WordId);
            await SeedExampleSentencesForWordAsync(word.WordId);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} words for set {SetId}", count, setId);
    }

    private async Task SeedTranslationsForWordAsync(Guid wordId)
    {
        int translationCount = Randomizer.Seed.Next(1, 4);

        Faker<TranslationEntity>? translationFaker = new Faker<TranslationEntity>()
            .RuleFor(t => t.TranslationId, f => Guid.NewGuid())
            .RuleFor(t => t.Translation, f => f.Lorem.Word())
            .RuleFor(t => t.WordId, wordId)
            .RuleFor(t => t.Order, f => f.IndexFaker);

        List<TranslationEntity>? translations = translationFaker.Generate(translationCount);
        _context.Set<TranslationEntity>().AddRange(translations);
        await _context.SaveChangesAsync();
    }

    private async Task SeedExampleSentencesForWordAsync(Guid wordId)
    {
        int sentenceCount = Randomizer.Seed.Next(0, 3);
        if (sentenceCount == 0)
        {
            return;
        }

        Faker<ExampleSentenceEntity> sentenceFaker = new Faker<ExampleSentenceEntity>()
            .RuleFor(e => e.ExampleSentenceId, f => Guid.NewGuid())
            .RuleFor(e => e.Sentence, f => f.Lorem.Sentence())
            .RuleFor(e => e.WordId, wordId)
            .RuleFor(e => e.Order, f => f.IndexFaker);

        List<ExampleSentenceEntity> sentences = sentenceFaker.Generate(sentenceCount);
        _context.Set<ExampleSentenceEntity>().AddRange(sentences);
        await _context.SaveChangesAsync();
    }

    private async Task<UserSetSequenceEntity> GetOrCreateSequenceAsync(string userId)
    {
        UserSetSequenceEntity? sequence = await _context.Set<UserSetSequenceEntity>()
            .FirstOrDefaultAsync(entity => entity.UserId == userId);
        if (sequence != null)
        {
            return sequence;
        }

        sequence = new UserSetSequenceEntity
        {
            UserSetSequenceId = Guid.CreateVersion7(),
            UserId = userId,
            NextValue = 1,
            LastUpdated = DateTimeOffset.UtcNow
        };
        await _context.Set<UserSetSequenceEntity>().AddAsync(sequence);
        await _context.SaveChangesAsync();

        return sequence;
    }
}
