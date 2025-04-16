using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace LexicaNext.Core.Queries.GetAppStatus;

public static class GetAppStatusEndpoint
{
    public const string Name = "GetAppStatus";

    public static void MapGetAppStatusEndpoint(this WebApplication app)
    {
        app.MapGet("/api/status", Handle).WithName(Name);
    }

    private static Ok<GetAppStatusResponse> Handle(CancellationToken cancellationToken)
    {
        GetAppStatusResponse response = new()
        {
            Status = "OK"
        };

        return TypedResults.Ok(response);
    }
}

public class GetAppStatusResponse
{
    public string Status { get; init; } = "";
}
