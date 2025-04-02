using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Commands.UpdateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace LexicaNext.Core.Commands.UpdateSet;

public static class UpdateSetEndpoint
{
    public const string Name = "UpdateSet";

    public static void MapUpdateSetEndpoint(this WebApplication app)
    {
        app.MapGet("/sets/{setId}", HandleAsync).WithName(Name);
    }

    private static async Task<Results<ProblemHttpResult, NoContent>> HandleAsync(
        UpdateSetRequest updateSetRequest,
        IValidator<UpdateSetRequest> validator,
        IUpdateSetCommandMapper updateSetCommandMapper,
        IUpdateSetRepository updateSetRepository,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(updateSetRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        UpdateSetCommand command = updateSetCommandMapper.Map(updateSetRequest);
        await updateSetRepository.UpdateSetAsync(command, cancellationToken);

        return TypedResults.NoContent();
    }
}

public class UpdateSetRequest
{
    public Guid SetId { get; set; }

    public string SetName { get; set; } = "";

    public List<EntryDto> Entries { get; set; } = [];
}

public class EntryDto
{
    public string Word { get; set; } = "";

    public string WordType { get; set; } = "";

    public List<string> Translations { get; set; } = [];
}
