namespace LexicaNext.WebApp;

internal static class SecurityHeadersPolicyFactory
{
    public static HeaderPolicyCollection Build(IConfiguration configuration)
    {
        HeaderPolicyCollection policy = new HeaderPolicyCollection().AddDefaultSecurityHeaders();

        string? auth0Domain = configuration["Auth0:Domain"];
        if (string.IsNullOrWhiteSpace(auth0Domain))
        {
            throw new InvalidOperationException("Auth0:Domain is not configured.");
        }

        string auth0Origin = $"https://{auth0Domain}";

        return policy.AddContentSecurityPolicy(
            builder =>
            {
                builder.AddDefaultSrc().Self();
                builder.AddScriptSrc().Self();
                builder.AddStyleSrc().Self().UnsafeInline();
                builder.AddImgSrc().Self().From("data:");
                builder.AddFontSrc().Self().From("data:");
                builder.AddConnectSrc().Self().From(auth0Origin);
                builder.AddFrameSrc().From(auth0Origin);
                builder.AddFormAction().Self().From(auth0Origin);
                builder.AddBaseUri().Self();
                builder.AddFrameAncestors().None();
                builder.AddObjectSrc().None();
            }
        );
    }
}
