using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;

namespace LexicaNext.Core.Commands.DeleteWords.Services;

public interface IDeleteWordsRequestValidator
{
    Task<ValidationResult> ValidateAsync(DeleteWordsRequest instance, CancellationToken cancellation);
}

public class DeleteWordsRequestValidator
    : AbstractValidator<DeleteWordsRequest>, IDeleteWordsRequestValidator, ITransientService
{
    public DeleteWordsRequestValidator()
    {
        AddValidationForIds();
    }

    private void AddValidationForIds()
    {
        RuleFor(request => request.Ids)
            .NotEmpty()
            .Must(ids => ids.Count <= 100)
            .WithMessage("'{PropertyName}' must contain 100 items or fewer.")
            .WithName(nameof(DeleteWordsRequest.Ids));
    }
}
