using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Options;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Testcontainers.PostgreSql;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication;

public class WebApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public PostgreSqlContainer DbContainer { get; } = new PostgreSqlBuilder().WithImage("postgres:16").Build();

    public WireMockServer WireMockServer { get; } = WireMockServer.Start();

    public VerifySettings VerifySettings { get; } = VerifySettingsBuilder.Build();

    public LogMessages LogMessages { get; } = new();

    public async Task InitializeAsync()
    {
        await DbContainer.StartAsync();

        Services.ExecuteDbMigration();
    }

    public new async Task DisposeAsync()
    {
        await DbContainer.DisposeAsync();
        WireMockServer.Dispose();
        await base.DisposeAsync();
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureHostConfiguration(SetDatabaseConnectionString);

        return base.CreateHost(builder);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        DisableLogging(builder);
        DisableUserSecrets(builder);
    }

    private void SetDatabaseConnectionString(IConfigurationBuilder configBuilder)
    {
        string dbConnectionString = DbContainer.GetConnectionString();
        configBuilder.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                [$"{ConnectionStringsOptions.Position}:{nameof(ConnectionStringsOptions.AppPostgresDb)}"] =
                    dbConnectionString
            }
        );
    }

    private void DisableLogging(IWebHostBuilder builder)
    {
        builder.ConfigureLogging(
            loggingBuilder =>
            {
                loggingBuilder.ClearProviders();
                loggingBuilder.AddProvider(new TestLoggerProvider(LogMessages));
            }
        );
    }

    private static void DisableUserSecrets(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(
            (_, configBuilder) =>
            {
                IConfigurationSource? userSecretsSource = configBuilder.Sources.FirstOrDefault(
                    source => source is JsonConfigurationSource { Path: "secrets.json" }
                );
                if (userSecretsSource is not null)
                {
                    configBuilder.Sources.Remove(userSecretsSource);
                }
            }
        );
    }

    private static void ConfigureHttpsPort(IWebHostBuilder builder)
    {
        builder.ConfigureServices(
            services => { services.PostConfigure<HttpsRedirectionOptions>(options => { options.HttpsPort = 443; }); }
        );
    }
}
