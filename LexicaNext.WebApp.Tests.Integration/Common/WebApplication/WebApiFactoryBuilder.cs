using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.WebApp.Tests.Integration.Common.Authentication;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication;

internal static class WebApiFactoryBuilder
{
    public static WebApplicationFactory<Program> WithCustomOptions(
        this WebApplicationFactory<Program> webApplicationFactory,
        Dictionary<string, string?> customOptions
    )
    {
        return webApplicationFactory.WithWebHostBuilder(
            builder => builder.ConfigureAppConfiguration(
                (_, configBuilder) => configBuilder.AddInMemoryCollection(customOptions)
            )
        );
    }

    public static WebApplicationFactory<Program> DisableAuth(
        this WebApplicationFactory<Program> webApiFactory
    )
    {
        return webApiFactory.DisableAuthentication();
    }

    public static WebApplicationFactory<Program> DisableAuthentication(
        this WebApplicationFactory<Program> webApiFactory
    )
    {
        return webApiFactory.WithWebHostBuilder(
            builder => builder.ConfigureServices(
                services => services.AddSingleton<IAuthorizationHandler, AllowAnonymous>()
            )
        );
    }

    public static WebApplicationFactory<Program> ReplaceService<T>(
        this WebApplicationFactory<Program> webApiFactory,
        T instance,
        ServiceLifetime serviceLifetime
    ) where T : class
    {
        return webApiFactory.ReplaceService<T>(
            new List<T>
            {
                instance
            },
            serviceLifetime
        );
    }

    public static WebApplicationFactory<Program> ReplaceService<T>(
        this WebApplicationFactory<Program> webApiFactory,
        IReadOnlyCollection<T> instances,
        ServiceLifetime serviceLifetime
    ) where T : class
    {
        return webApiFactory.WithWebHostBuilder(
            builder => builder.ConfigureServices(
                services =>
                {
                    services.RemoveService(typeof(T));
                    foreach (T instance in instances)
                    {
                        services.RegisterService(instance, serviceLifetime);
                    }
                }
            )
        );
    }

    public static void RemoveService(this IServiceCollection services, Type serviceType)
    {
        services.RemoveService(d => d.ServiceType == serviceType);
    }

    private static void RemoveService(this IServiceCollection services, Type serviceType, Type implementationType)
    {
        services.RemoveService(d => d.ServiceType == serviceType && d.ImplementationType == implementationType);
    }

    private static void RemoveService(this IServiceCollection services, Func<ServiceDescriptor, bool> condition)
    {
        List<ServiceDescriptor> serviceDescriptors = services.Where(condition).ToList();
        foreach (ServiceDescriptor serviceDescriptor in serviceDescriptors)
        {
            services.Remove(serviceDescriptor);
        }
    }

    private static void RegisterService<T>(
        this IServiceCollection services,
        T instance,
        ServiceLifetime serviceLifetime
    ) where T : class
    {
        switch (serviceLifetime)
        {
            case ServiceLifetime.Transient:
                services.AddTransient<T>(_ => instance);
                break;
            case ServiceLifetime.Scoped:
                services.AddScoped<T>(_ => instance);
                break;
            case ServiceLifetime.Singleton:
                services.AddSingleton<T>(_ => instance);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(serviceLifetime), serviceLifetime, null);
        }
    }

    public static WebApplicationFactory<Program> MockUtcNow(
        this WebApplicationFactory<Program> webApiFactory,
        DateTimeOffset utcNow
    )
    {
        IDateTimeOffsetProvider? dateTimeOffsetProvider = Substitute.For<IDateTimeOffsetProvider>();
        dateTimeOffsetProvider.UtcNow.Returns(utcNow);

        return webApiFactory.ReplaceService(dateTimeOffsetProvider, ServiceLifetime.Singleton);
    }

    public static WebApplicationFactory<Program> WithLogging(
        this WebApplicationFactory<Program> webApplicationFactory,
        LogMessages logMessage,
        string category,
        LogLevel level = LogLevel.Debug
    )
    {
        logMessage.AllowedCategories.Add(category);

        return webApplicationFactory.WithCustomOptions(
            new Dictionary<string, string?>
            {
                [$"Logging:LogLevel:{category}"] = level.ToString()
            }
        );
    }
}
