using FluentValidation;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetRecording.Services;

public class GetRecordingRequestValidator : AbstractValidator<GetRecordingRequest>
{
    public GetRecordingRequestValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
    }

    private void AddValidationForWord()
    {
        RuleFor(request => request.Word).NotEmpty().MaximumLength(100);
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(GetRecordingRequest.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }
}
