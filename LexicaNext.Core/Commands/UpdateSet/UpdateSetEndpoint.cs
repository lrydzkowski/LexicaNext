using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Commands.UpdateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.UpdateSet;

public static class UpdateSetEndpoint
{
    public const string Name = "UpdateSet";

    public static void MapUpdateSetEndpoint(this WebApplication app)
    {
        app.MapPut("/api/sets/{setId}", HandleAsync).WithName(Name).RequireAuthorization();
    }

    private static async Task<Results<NotFound, ProblemHttpResult, NoContent>> HandleAsync(
        [AsParameters] UpdateSetRequest request,
        IValidator<UpdateSetRequest> validator,
        IUpdateSetCommandMapper updateSetCommandMapper,
        IUpdateSetRepository updateSetRepository,
        CancellationToken cancellationToken
    )
    {
        if (!Guid.TryParse(request.SetId, out Guid setId))
        {
            return TypedResults.NotFound();
        }

        bool exists = await updateSetRepository.SetExistsAsync(setId, cancellationToken);
        if (!exists)
        {
            return TypedResults.NotFound();
        }

        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        UpdateSetCommand command = updateSetCommandMapper.Map(request);
        await updateSetRepository.UpdateSetAsync(command, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class UpdateSetRequest
{
    public string SetId { get; set; } = "";

    [FromBody]
    public UpdateSetRequestPayload? Payload { get; init; }
}

public class UpdateSetRequestPayload
{
    public string SetName { get; set; } = "";

    public List<EntryDto> Entries { get; set; } = [];
}

public class EntryDto
{
    public string Word { get; set; } = "";

    public string WordType { get; set; } = "";

    public List<string> Translations { get; set; } = [];
}
