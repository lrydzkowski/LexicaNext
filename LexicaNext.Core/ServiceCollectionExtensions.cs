using System.Reflection;
using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.Core;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCoreServices(this IServiceCollection services)
    {
        return services.AddAppHealthChecks().AddScrutor().AddFluentValidation();
    }

    public static IServiceCollection AddOptionsType<TOptions>(
        this IServiceCollection services,
        IConfiguration configuration,
        string configurationPosition
    ) where TOptions : class
    {
        services.AddOptions<TOptions>().Bind(configuration.GetSection(configurationPosition));

        return services;
    }

    private static IServiceCollection AddAppHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks();

        return services;
    }

    private static IServiceCollection AddScrutor(this IServiceCollection services)
    {
        return services.Scan(
            scan => scan
                .FromAssemblyDependencies(Assembly.GetEntryAssembly()!)
                .AddClasses(classes => classes.AssignableTo<ITransientService>(), false)
                .AsImplementedInterfaces()
                .WithTransientLifetime()
                .AddClasses(classes => classes.AssignableTo<IScopedService>(), false)
                .AsImplementedInterfaces()
                .WithScopedLifetime()
                .AddClasses(classes => classes.AssignableTo<ISingletonService>(), false)
                .AsImplementedInterfaces()
                .WithSingletonLifetime()
        );
    }

    private static IServiceCollection AddFluentValidation(this IServiceCollection services)
    {
        return services.AddValidatorsFromAssemblyContaining(typeof(ServiceCollectionExtensions))!;
    }
}
