using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.DeleteSets.Services;

public interface IDeleteSetsRequestValidator
{
    Task<ValidationResult> ValidateAsync(DeleteSetsRequest instance, CancellationToken cancellation);
}

public class DeleteSetsRequestValidator
    : AbstractValidator<DeleteSetsRequest>, IDeleteSetsRequestValidator, ITransientService
{
    public DeleteSetsRequestValidator()
    {
        AddValidationForIds();
    }

    private void AddValidationForIds()
    {
        RuleFor(request => request.Ids)
            .NotEmpty()
            .Must(ids => ids.Count <= 100)
            .WithMessage("'{PropertyName}' must contain 100 items or fewer.")
            .WithName(nameof(DeleteSetsRequest.Ids));
    }
}
