namespace LexicaNext.WebApp.Security;

internal static class SecurityHeadersPolicyFactory
{
    public static HeaderPolicyCollection BuildApi()
    {
        return new HeaderPolicyCollection()
            .AddStrictTransportSecurityMaxAgeIncludeSubDomains()
            .AddContentTypeOptionsNoSniff()
            .AddReferrerPolicyStrictOriginWhenCrossOrigin()
            .AddFrameOptionsDeny()
            .AddCrossOriginResourcePolicy(b => b.SameOrigin())
            .AddContentSecurityPolicy(
                builder =>
                {
                    builder.AddDefaultSrc().None();
                    builder.AddFrameAncestors().None();
                }
            )
            .RemoveServerHeader();
    }

    public static HeaderPolicyCollection Build(IConfiguration configuration)
    {
        string? auth0Domain = configuration["Auth0:Domain"];
        if (string.IsNullOrWhiteSpace(auth0Domain))
        {
            throw new InvalidOperationException("Auth0:Domain is not configured.");
        }

        string auth0Origin = $"https://{auth0Domain}";

        HeaderPolicyCollection policy = new HeaderPolicyCollection()
            .AddDefaultSecurityHeaders()
            .AddStrictTransportSecurityMaxAgeIncludeSubDomains()
            .AddPermissionsPolicy(
                builder =>
                {
                    builder.AddCamera().None();
                    builder.AddMicrophone().None();
                    builder.AddGeolocation().None();
                    builder.AddPayment().None();
                    builder.AddUsb().None();
                    builder.AddAccelerometer().None();
                    builder.AddGyroscope().None();
                    builder.AddMagnetometer().None();
                }
            )
            .RemoveServerHeader();

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
                builder.AddMediaSrc().Self().From("blob:");
            }
        );
    }
}
