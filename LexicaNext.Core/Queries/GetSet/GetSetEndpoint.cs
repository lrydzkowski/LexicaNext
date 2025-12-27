using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetSet.Interfaces;
using LexicaNext.Core.Queries.GetSet.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Queries.GetSet;

public static class GetSetEndpoint
{
    public const string Name = "GetSet";

    public static void MapGetSetEndpoint(this WebApplication app)
    {
        app.MapGet("/api/sets/{setId}", HandleAsync)
            .WithName(Name)
            .WithSummary("Return a set represented by the given id")
            .Produces<GetSetResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<NotFound, Ok<GetSetResponse>>> HandleAsync(
        [AsParameters] GetSetRequest request,
        [FromServices] IGetSetRepository getSetRepository,
        [FromServices] ISetMapper setMapper,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.SetId, out Guid setId))
        {
            return TypedResults.NotFound();
        }

        Set? set = await getSetRepository.GetSetAsync(setId, cancellationToken);
        if (set is null)
        {
            return TypedResults.NotFound();
        }

        GetSetResponse response = setMapper.Map(set);

        return TypedResults.Ok(response);
    }
}

public class GetSetRequest
{
    public string SetId { get; init; } = "";
}

public class GetSetResponse
{
    public Guid SetId { get; init; }

    public string Name { get; init; } = "";

    public List<EntryDto> Entries { get; init; } = [];

    public DateTimeOffset CreatedAt { get; init; }
}

public class EntryDto
{
    public string Word { get; set; } = "";

    public string WordType { get; set; } = "";

    public List<string> Translations { get; set; } = [];

    public List<string> ExampleSentences { get; set; } = [];
}
