namespace LexicaNext.WebApp;

internal static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWebAppServices(this IServiceCollection services)
    {
        services.AddProblemDetails();
        services.AddOpenApi();
        services.AddHttpContextAccessor();

        return services;
    }

    private static void AddOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi(
            "v1",
            options =>
            {
                options.AddDocumentTransformer(
                    (document, _, _) =>
                    {
                        document.Servers = [];

                        return Task.CompletedTask;
                    }
                );
            }
        );
    }
}
