using FluentValidation;
using FluentValidation.Results;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetWordSets.Services;

public interface IGetWordSetsRequestValidator
{
    Task<ValidationResult> ValidateAsync(GetWordSetsRequest instance, CancellationToken cancellation);
}

public class GetWordSetsRequestValidator
    : AbstractValidator<GetWordSetsRequest>, IGetWordSetsRequestValidator, ITransientService
{
    public GetWordSetsRequestValidator()
    {
        AddValidationForWordId();
    }

    private void AddValidationForWordId()
    {
        RuleFor(request => request.WordId)
            .Must(wordId => Guid.TryParse(wordId, out _))
            .WithMessage("'{PropertyName}' must be a valid GUID format.")
            .WithErrorCode(ValidationErrorCodes.FormatValidator);
    }
}
