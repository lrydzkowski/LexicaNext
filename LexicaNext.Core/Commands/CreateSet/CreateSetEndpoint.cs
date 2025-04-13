using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Commands.CreateSet.Services;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.CreateSet;

public static class CreateSetEndpoint
{
    public const string Name = "CreateSet";

    public static void MapCreateSetEndpoint(this WebApplication app)
    {
        app.MapPost("/sets", HandleAsync).WithName(Name).RequireAuthorization();
    }

    private static async Task<Results<ProblemHttpResult, Ok<CreateSetResponse>>> HandleAsync(
        [AsParameters] CreateSetRequest request,
        IValidator<CreateSetRequest> validator,
        ICreateSetCommandMapper createSetCommandMapper,
        ICreateSetRepository createSetRepository,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        CreateSetCommand command = createSetCommandMapper.Map(request);
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
    [FromBody]
    public CreateSetRequestPayload? Payload { get; init; }
}

public class CreateSetRequestPayload
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
