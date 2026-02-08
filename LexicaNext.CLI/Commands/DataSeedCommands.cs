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
        [Option('u', "user-id", Description = "User ID to assign to the seeded sets")]
        string userId,
        [Option('c', "count", Description = "Number of sets to create")]
        int count = 10
    )
    {
        try
        {
            _logger.LogInformation("Starting to seed {Count} sets for user '{UserId}'...", count, userId);
            await _dataSeedService.SeedSetsAsync(userId, count);
            _logger.LogInformation("Successfully seeded {Count} sets for user '{UserId}'", count, userId);
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding sets");
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
