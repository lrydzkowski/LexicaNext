using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.CreateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;

namespace LexicaNext.Core.Commands.CreateSet;

public static class CreateSetEndpoint
{
    public const string Name = "CreateSet";

    public static void MapCreateSetEndpoint(this WebApplication app)
    {
        app.MapPost("/sets/{setId}", HandleAsync).WithName(Name);
    }

    private static async Task<Results<ProblemHttpResult, Ok<CreateSetResponse>>> HandleAsync(
        CreateSetRequest createSetRequest,
        IValidator<CreateSetRequest> validator,
        ICreateSetCommandMapper createSetCommandMapper,
        ICreateSetRepository createSetRepository,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(createSetRequest, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        CreateSetCommand command = createSetCommandMapper.Map(createSetRequest);
        Guid setId = await createSetRepository.CreateSetAsync(command, cancellationToken);
        CreateSetResponse response = new()
        {
            SetId = setId
        };

        return TypedResults.Ok(response);
    }
}

public class CreateSetRequest
{
    public string SetName { get; init; } = "";

    public List<EntryDto> Entries { get; set; } = [];
}

public class EntryDto
{
    public string Word { get; set; } = "";

    public string WordType { get; set; } = "";

    public List<string> Translations { get; set; } = [];
}

public class CreateSetResponse
{
    public Guid SetId { get; init; }
}
