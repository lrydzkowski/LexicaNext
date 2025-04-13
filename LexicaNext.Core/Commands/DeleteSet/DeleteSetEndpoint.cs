using LexicaNext.Core.Commands.DeleteSet.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace LexicaNext.Core.Commands.DeleteSet;

public static class DeleteSetEndpoint
{
    public const string Name = "DeleteSet";

    public static void MapDeleteSetEndpoint(this WebApplication app)
    {
        app.MapDelete("/sets/{setId}", HandleAsync).WithName(Name).RequireAuthorization();
    }

    private static async Task<Results<NotFound, NoContent>> HandleAsync(
        [AsParameters] DeleteSetRequest request,
        IDeleteSetRepository deleteSetRepository,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.SetId, out Guid setId))
        {
            return TypedResults.NotFound();
        }

        await deleteSetRepository.DeleteSetAsync(setId, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteSetRequest
{
    public string SetId { get; init; } = "";
}
