using CommandDotNet;
using CommandDotNet.IoC.MicrosoftDependencyInjection;
using LexicaNext.CLI.Commands;
using LexicaNext.CLI.Services;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LexicaNext.CLI;

internal class Program
{
    private static int Main(string[] args)
    {
        IHost host = CreateHost();

        AppRunner appRunner = new AppRunner<DataSeedCommands>()
            .UseMicrosoftDependencyInjection(host.Services);

        return appRunner.Run(args);
    }

    private static IHost CreateHost()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", false)
            .AddEnvironmentVariables()
            .AddUserSecrets<Program>()
            .Build();

        return Host.CreateDefaultBuilder()
            .ConfigureServices(
                (_, services) =>
                {
                    services.AddSingleton(configuration);
                    services.AddInfrastructureServices(configuration);
                    services.AddSingleton<ISerializer, Serializer>();
                    services.AddScoped<IDataSeedService, DataSeedService>();
                    services.AddScoped<DataSeedCommands>();
                }
            )
            .Build();
    }
}
