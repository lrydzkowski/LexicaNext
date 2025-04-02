using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetSet.Interfaces;
using LexicaNext.Core.Queries.GetSet.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace LexicaNext.Core.Queries.GetSet;

public static class GetSetEndpoint
{
    public const string Name = "GetSet";

    public static void MapGetSetEndpoint(this WebApplication app)
    {
        app.MapGet("/sets/{setId}", HandleAsync).WithName(Name);
    }

    private static async Task<Results<NotFound, Ok<GetSetResponse>>> HandleAsync(
        [AsParameters] GetSetRequest request,
        IGetSetRepository getSetRepository,
        ISetMapper setMapper,
        CancellationToken cancellationToken
    )
    {
        Set? set = await getSetRepository.GetSetAsync(request.SetId, cancellationToken);
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
    public Guid SetId { get; init; }
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
}
