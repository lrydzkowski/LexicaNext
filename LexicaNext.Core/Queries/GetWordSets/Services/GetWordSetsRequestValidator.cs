using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Models;

namespace LexicaNext.Core.Queries.GetWordSets.Services;

public class GetWordSetsRequestValidator : AbstractValidator<GetWordSetsRequest>
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
