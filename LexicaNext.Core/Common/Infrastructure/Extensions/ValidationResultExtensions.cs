using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LexicaNext.Core.Common.Infrastructure.Extensions;

internal static class ValidationResultExtensions
{
    public static ProblemDetails ToProblemDetails(this ValidationResult validationResult)
    {
        return new ProblemDetails
        {
            Type = ProblemTypes.ValidationErrors,
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation errors",
            Detail = "One or more validation errors occurred.",
            Extensions = new Dictionary<string, object?>
            {
                ["errors"] = validationResult.Errors.Select(
                        error => new
                        {
                            error.PropertyName,
                            error.ErrorMessage,
                            error.AttemptedValue,
                            error.Severity
                        }
                    )
                    .ToList()
            }
        };
    }
}
