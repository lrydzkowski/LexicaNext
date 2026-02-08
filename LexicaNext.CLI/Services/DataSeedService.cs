using Bogus;
using LexicaNext.Core.Commands.GenerateTranslations.Interfaces;
using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LexicaNext.CLI.Services;

internal interface IDataSeedService
{
    Task SeedSetsAsync(string userId, int count = 10);

    Task ClearAllDataAsync();
}

internal class DataSeedService : IDataSeedService
{
    private const int MaxParallelJobs = 5;

    private readonly IAiGenerationService _aiGenerationService;
    private readonly AppDbContext _context;
    private readonly ILogger<DataSeedService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public DataSeedService(
        AppDbContext context,
        IServiceScopeFactory scopeFactory,
        ILogger<DataSeedService> logger,
        IAiGenerationService aiGenerationService
    )
    {
        _context = context;
        _scopeFactory = scopeFactory;
        _logger = logger;
        _aiGenerationService = aiGenerationService;
    }

    public async Task SeedSetsAsync(string userId, int count = 10)
    {
        List<SetEntity> sets = await CreateSetsAsync(userId, count);

        Dictionary<string, WordTypeEntity> wordTypes = await _context.Set<WordTypeEntity>()
            .ToDictionaryAsync(wt => wt.Name, StringComparer.OrdinalIgnoreCase);
        if (wordTypes.Count == 0)
        {
            _logger.LogError("No word types found in database. Run EF Core migrations to seed word types");

            return;
        }

        List<WordEntity> words = await GenerateWordsAsync(userId, sets.Count, wordTypes);
        if (words.Count == 0)
        {
            _logger.LogWarning("No unique words generated");

            return;
        }

        await SeedTranslationsAndExamplesAsync(words, wordTypes);
        await DistributeWordsAcrossSetsAsync(words, sets);
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

    private async Task<List<SetEntity>> CreateSetsAsync(string userId, int count)
    {
        UserSetSequenceEntity sequenceEntity = await GetOrCreateSequenceAsync(userId);

        Faker faker = new();
        List<DateTimeOffset> dates = Enumerable.Range(0, count)
            .Select(_ => faker.Date.PastOffset(26).ToUniversalTime())
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

        return sets;
    }

    private async Task<List<WordEntity>> GenerateWordsAsync(
        string userId,
        int setCount,
        Dictionary<string, WordTypeEntity> wordTypes
    )
    {
        HashSet<(string Word, Guid WordTypeId)> existingWords = (await _context.Set<WordEntity>()
                .Where(w => w.UserId == userId)
                .Select(w => new { w.Word, w.WordTypeId })
                .ToListAsync())
            .Select(w => (w.Word.ToLower(), w.WordTypeId))
            .ToHashSet();

        int totalWordCount = Enumerable.Range(0, setCount).Sum(_ => Random.Shared.Next(5, 25));

        IReadOnlyList<GeneratedWord> generatedWords = await _aiGenerationService.GenerateWordsAsync(totalWordCount);

        Faker faker = new();
        List<WordEntity> words = [];
        foreach (GeneratedWord generated in generatedWords)
        {
            if (!wordTypes.TryGetValue(generated.WordType, out WordTypeEntity? wordTypeEntity))
            {
                continue;
            }

            (string, Guid) key = (generated.Word.ToLower(), wordTypeEntity.WordTypeId);
            if (!existingWords.Add(key))
            {
                continue;
            }

            words.Add(
                new WordEntity
                {
                    WordId = Guid.NewGuid(),
                    UserId = userId,
                    Word = generated.Word,
                    WordTypeId = wordTypeEntity.WordTypeId,
                    CreatedAt = faker.Date.PastOffset(26).ToUniversalTime()
                }
            );
        }

        _context.Set<WordEntity>().AddRange(words);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Generated {Count} words, seeding translations and examples", words.Count);

        return words;
    }

    private async Task SeedTranslationsAndExamplesAsync(
        List<WordEntity> words,
        Dictionary<string, WordTypeEntity> wordTypes
    )
    {
        Dictionary<Guid, string> wordTypeIdToName = wordTypes.ToDictionary(wt => wt.Value.WordTypeId, wt => wt.Key);

        ParallelOptions parallelOptions = new() { MaxDegreeOfParallelism = MaxParallelJobs };
        await Parallel.ForEachAsync(
            words,
            parallelOptions,
            async (word, ct) =>
            {
                try
                {
                    string wordTypeName = wordTypeIdToName[word.WordTypeId];

                    await using AsyncServiceScope scope = _scopeFactory.CreateAsyncScope();
                    AppDbContext context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    IAiGenerationService aiService =
                        scope.ServiceProvider.GetRequiredService<IAiGenerationService>();

                    await SeedTranslationsForWordAsync(context, aiService, word, wordTypeName, ct);
                    await SeedExampleSentencesForWordAsync(context, aiService, word, wordTypeName, ct);

                    _logger.LogInformation("Seeded translations and examples for \"{Word}\"", word.Word);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Failed to seed translations/examples for \"{Word}\"", word.Word);
                }
            }
        );
    }

    private async Task DistributeWordsAcrossSetsAsync(List<WordEntity> words, List<SetEntity> sets)
    {
        List<WordEntity> shuffled = words.OrderBy(_ => Random.Shared.Next()).ToList();

        int wordsPerSet = shuffled.Count / sets.Count;
        int remainder = shuffled.Count % sets.Count;
        int offset = 0;

        foreach (SetEntity set in sets)
        {
            int setWordCount = wordsPerSet + (remainder > 0 ? 1 : 0);
            remainder--;

            for (int i = 0; i < setWordCount && offset < shuffled.Count; i++)
            {
                _context.Set<SetWordEntity>()
                    .Add(
                        new SetWordEntity
                        {
                            SetId = set.SetId,
                            WordId = shuffled[offset].WordId,
                            Order = i
                        }
                    );
                offset++;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Distributed words across {Count} sets", sets.Count);
    }

    private static async Task SeedTranslationsForWordAsync(
        AppDbContext context,
        IAiGenerationService aiService,
        WordEntity wordEntity,
        string wordType,
        CancellationToken ct
    )
    {
        int translationCount = Random.Shared.Next(1, 4);

        IReadOnlyList<string> translations =
            await aiService.GenerateTranslationsAsync(wordEntity.Word, wordType, translationCount, ct);

        for (int i = 0; i < translations.Count; i++)
        {
            context.Set<TranslationEntity>()
                .Add(
                    new TranslationEntity
                    {
                        TranslationId = Guid.NewGuid(),
                        Translation = translations[i],
                        WordId = wordEntity.WordId,
                        Order = i
                    }
                );
        }

        await context.SaveChangesAsync(ct);
    }

    private static async Task SeedExampleSentencesForWordAsync(
        AppDbContext context,
        IAiGenerationService aiService,
        WordEntity wordEntity,
        string wordType,
        CancellationToken ct
    )
    {
        int sentenceCount = Random.Shared.Next(0, 3);
        if (sentenceCount == 0)
        {
            return;
        }

        IReadOnlyList<string> sentences =
            await aiService.GenerateExampleSentencesAsync(wordEntity.Word, wordType, sentenceCount, ct);

        for (int i = 0; i < sentences.Count; i++)
        {
            context.Set<ExampleSentenceEntity>()
                .Add(
                    new ExampleSentenceEntity
                    {
                        ExampleSentenceId = Guid.NewGuid(),
                        Sentence = sentences[i],
                        WordId = wordEntity.WordId,
                        Order = i
                    }
                );
        }

        await context.SaveChangesAsync(ct);
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
