using CommandDotNet;
using LexicaNext.CLI.Services;
using Microsoft.Extensions.Logging;

namespace LexicaNext.CLI.Commands;

internal class DataSeedCommands
{
    private readonly IDataSeedService _dataSeedService;
    private readonly ILogger<DataSeedCommands> _logger;

    public DataSeedCommands(IDataSeedService dataSeedService, ILogger<DataSeedCommands> logger)
    {
        _dataSeedService = dataSeedService;
        _logger = logger;
    }

    [Command("seed-sets", Description = "Seeds the database with random sets and their words")]
    public async Task<int> SeedSetsAsync(
        [Option('c', "count", Description = "Number of sets to create")]
        int count = 10
    )
    {
        try
        {
            _logger.LogInformation("Starting to seed {Count} sets...", count);
            await _dataSeedService.SeedSetsAsync(count);
            _logger.LogInformation("Successfully seeded {Count} sets", count);
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding sets");
            return 1;
        }
    }

    [Command("seed-words", Description = "Seeds words for a specific set")]
    public async Task<int> SeedWordsAsync(
        [Operand("setName", Description = "Name or partial name of the set")]
        string setName,
        [Option('c', "count", Description = "Number of words to create")]
        int count = 20
    )
    {
        try
        {
            _logger.LogInformation("Starting to seed {Count} words for set containing '{SetName}'...", count, setName);
            await _dataSeedService.SeedWordsAsync(setName, count);
            _logger.LogInformation("Successfully seeded words for set containing '{SetName}'", setName);
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding words for set '{SetName}'", setName);
            return 1;
        }
    }

    [Command("seed-word-types", Description = "Seeds the database with basic word types")]
    public async Task<int> SeedWordTypesAsync()
    {
        try
        {
            _logger.LogInformation("Starting to seed word types...");
            await _dataSeedService.SeedWordTypesAsync();
            _logger.LogInformation("Successfully seeded word types");
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding word types");
            return 1;
        }
    }

    [Command("clear-data", Description = "Clears all data from the database")]
    public async Task<int> ClearDataAsync(
        [Option("confirm", Description = "Confirm deletion of all data")]
        bool confirm = false
    )
    {
        if (!confirm)
        {
            _logger.LogWarning("This will delete ALL data from the database. Use --confirm to proceed");
            return 1;
        }

        try
        {
            _logger.LogInformation("Starting to clear all data...");
            await _dataSeedService.ClearAllDataAsync();
            _logger.LogInformation("Successfully cleared all data");
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing data");
            return 1;
        }
    }
}
