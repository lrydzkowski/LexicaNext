using FluentValidation;
using LexicaNext.Core.Commands.UpdateWord.Interfaces;
using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Services;

public class UpdateWordRequestValidator : AbstractValidator<UpdateWordRequest>
{
    public UpdateWordRequestValidator(IUpdateWordRepository updateWordRepository)
    {
        RuleFor(request => request.WordId)
            .NotEmpty()
            .Must(id => Guid.TryParse(id, out _))
            .DependentRules(
                () => RuleFor(request => request.Payload!)
                    .NotNull()
                    .SetValidator(
                        request => new UpdateWordRequestPayloadValidator(
                            Guid.Parse(request.WordId),
                            updateWordRepository
                        )
                    )
            )
            .WithMessage("'{PropertyName}' must be a valid GUID.");
    }
}

internal class UpdateWordRequestPayloadValidator : AbstractValidator<UpdateWordRequestPayload>
{
    public UpdateWordRequestPayloadValidator(Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        AddValidationForWord(wordId, updateWordRepository);
        AddValidationForWordType();
        AddValidationForTranslations();
        AddValidationForExampleSentences();
    }

    private void AddValidationForWord(Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        RuleFor(request => request.Word)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(() => AddValidationForWordUniqueness(wordId, updateWordRepository))
            .WithName(nameof(UpdateWordCommand.Word));
    }

    private void AddValidationForWordUniqueness(Guid wordId, IUpdateWordRepository updateWordRepository)
    {
        RuleFor(request => request)
            .MustAsync(
                async (request, cancellationToken) =>
                {
                    bool exists = await updateWordRepository.WordExistsAsync(
                        request.Word,
                        request.WordType,
                        wordId,
                        cancellationToken
                    );

                    return !exists;
                }
            )
            .WithMessage(request => $"The word '{request.Word}' with the type = '{request.WordType}' already exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForWordType()
    {
        RuleFor(request => request.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(UpdateWordCommand.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForTranslations()
    {
        RuleFor(request => request.Translations)
            .NotEmpty()
            .DependentRules(() => RuleForEach(request => request.Translations).NotEmpty().MaximumLength(200));
    }

    private void AddValidationForExampleSentences()
    {
        RuleForEach(request => request.ExampleSentences).NotEmpty().MaximumLength(500);
    }
}
