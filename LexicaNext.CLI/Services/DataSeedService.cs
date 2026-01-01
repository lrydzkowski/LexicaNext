using Bogus;
using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LexicaNext.CLI.Services;

internal interface IDataSeedService
{
    Task SeedSetsAsync(int count = 10);

    Task SeedWordsAsync(string setName, int count = 20);

    Task SeedWordTypesAsync();

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

    public async Task SeedWordTypesAsync()
    {
        int existingTypes = await _context.Set<WordTypeEntity>().CountAsync();
        if (existingTypes > 0)
        {
            _logger.LogInformation("Word types already exist. Skipping seed");
            return;
        }

        WordTypeEntity[] wordTypes =
        [
            new() { WordTypeId = Guid.NewGuid(), Name = "Noun" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Verb" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Adjective" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Adverb" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Preposition" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Pronoun" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Conjunction" },
            new() { WordTypeId = Guid.NewGuid(), Name = "Interjection" }
        ];

        _context.Set<WordTypeEntity>().AddRange(wordTypes);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} word types", wordTypes.Length);
    }

    public async Task SeedSetsAsync(int count = 10)
    {
        await SeedWordTypesAsync();

        HashSet<string> existingNames = (await _context.Set<SetEntity>()
                .Select(s => s.Name.ToLower())
                .ToListAsync())
            .ToHashSet();

        List<SetEntity> sets = new();
        int attempts = 0;
        int maxAttempts = count * 10;

        while (sets.Count < count && attempts < maxAttempts)
        {
            attempts++;

            int wordCount = Randomizer.Seed.Next(1, 5);
            string name = string.Join(
                " ",
                Enumerable.Range(0, wordCount)
                    .Select(_ => new Faker().Random.Word())
            );

            if (!existingNames.Contains(name.ToLower()))
            {
                existingNames.Add(name.ToLower());
                sets.Add(
                    new SetEntity
                    {
                        SetId = Guid.CreateVersion7(),
                        Name = name,
                        CreatedAt = new Faker().Date.PastOffset(365).ToUniversalTime()
                    }
                );
            }
        }

        if (sets.Count < count)
        {
            _logger.LogWarning(
                "Could only generate {ActualCount} unique sets out of {RequestedCount} after {Attempts} attempts",
                sets.Count,
                count,
                attempts
            );
        }

        _context.Set<SetEntity>().AddRange(sets);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} sets", sets.Count);

        foreach (SetEntity set in sets)
        {
            await SeedWordsForSetAsync(set.SetId, Randomizer.Seed.Next(5, 25));
        }
    }

    public async Task SeedWordsAsync(string setName, int count = 20)
    {
        SetEntity? set = await _context.Set<SetEntity>()
            .FirstOrDefaultAsync(s => s.Name.ToLower().Contains(setName.ToLower()));

        if (set == null)
        {
            _logger.LogWarning("Set with name containing '{SetName}' not found", setName);
            return;
        }

        await SeedWordsForSetAsync(set.SetId, count);
    }

    public async Task ClearAllDataAsync()
    {
        await _context.Set<SetWordEntity>().ExecuteDeleteAsync();
        await _context.Set<TranslationEntity>().ExecuteDeleteAsync();
        await _context.Set<WordEntity>().ExecuteDeleteAsync();
        await _context.Set<SetEntity>().ExecuteDeleteAsync();

        _logger.LogInformation("Cleared all data from database");
    }

    private async Task SeedWordsForSetAsync(Guid setId, int count)
    {
        List<WordTypeEntity> wordTypes = await _context.Set<WordTypeEntity>().ToListAsync();
        if (!wordTypes.Any())
        {
            await SeedWordTypesAsync();
            wordTypes = await _context.Set<WordTypeEntity>().ToListAsync();
        }

        HashSet<(string Word, Guid WordTypeId)> existingWords = (await _context.Set<WordEntity>()
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
            var key = (word.ToLower(), wordTypeId);

            if (existingWords.Contains(key))
            {
                continue;
            }

            existingWords.Add(key);
            words.Add(new WordEntity
            {
                WordId = Guid.NewGuid(),
                Word = word,
                WordTypeId = wordTypeId,
                CreatedAt = faker.Date.PastOffset(365).ToUniversalTime()
            });
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
}
