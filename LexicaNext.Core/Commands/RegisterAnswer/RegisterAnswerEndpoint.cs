using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Commands.RegisterAnswer.Interface;
using LexicaNext.Core.Commands.RegisterAnswer.Models;
using LexicaNext.Core.Commands.RegisterAnswer.Services;
using LexicaNext.Core.Common.Infrastructure.Auth;
using LexicaNext.Core.Common.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Commands.RegisterAnswer;

public static class RegisterAnswerEndpoint
{
    public const string Name = "RegisterAnswer";

    public static void MapRegisterAnswerEndpoint(this WebApplication app)
    {
        app.MapPost("/api/answer", HandleAsync)
            .WithName(Name)
            .WithSummary("Register an answer for a word")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status500InternalServerError)
            .RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey);
    }

    private static async Task<Results<ProblemHttpResult, NoContent>> HandleAsync(
        [AsParameters] RegisterAnswerRequest request,
        [FromServices] IValidator<RegisterAnswerRequest> validator,
        [FromServices] IRegisterAnswerCommandMapper registerAnswerCommandMapper,
        [FromServices] IRegisterAnswerRepository registerAnswerRepository,
        CancellationToken cancellationToken
    )
    {
        ValidationResult? validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.Problem(validationResult.ToProblemDetails());
        }

        RegisterAnswerCommand command = registerAnswerCommandMapper.Map(request);
        await registerAnswerRepository.RegisterAnswerAsync(command);

        return TypedResults.NoContent();
    }
}

public class RegisterAnswerRequest
{
    [FromBody]
    public RegisterAnswerRequestPayload? Payload { get; init; }
}

public class RegisterAnswerRequestPayload
{
    public string? Question { get; init; }

    public string? GivenAnswer { get; init; }

    public string? ExpectedAnswer { get; init; }
}
