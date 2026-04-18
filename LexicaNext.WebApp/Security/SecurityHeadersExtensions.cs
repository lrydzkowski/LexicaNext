namespace LexicaNext.WebApp.Security;

internal static class SecurityHeadersExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app, IConfiguration configuration)
    {
        return app.UseWhen(
            context => !IsApiPath(context),
            applicationBuilder =>
                applicationBuilder.UseSecurityHeaders(SecurityHeadersPolicyFactory.Build(configuration))
        );
    }

    public static IApplicationBuilder UseApiSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseWhen(
            IsApiPath,
            applicationBuilder => applicationBuilder.UseSecurityHeaders(SecurityHeadersPolicyFactory.BuildApi())
        );
    }

    private static bool IsApiPath(HttpContext context)
    {
        return context.Request.Path.StartsWithSegments("/api");
    }
}
