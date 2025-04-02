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
        app.MapDelete("/sets/{setId}", HandleAsync).WithName(Name);
    }

    private static async Task<NoContent> HandleAsync(
        DeleteSetRequest request,
        IDeleteSetRepository deleteSetRepository,
        CancellationToken cancellationToken
    )
    {
        await deleteSetRepository.DeleteSetAsync(request.SetId, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class DeleteSetRequest
{
    public Guid SetId { get; init; }
}
