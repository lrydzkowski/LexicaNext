using FluentValidation;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateSet.Services;

public class CreateSetRequestValidator : AbstractValidator<CreateSetRequest>
{
    private readonly ICreateSetRepository _createSetRepository;

    public CreateSetRequestValidator(ICreateSetRepository createSetRepository)
    {
        _createSetRepository = createSetRepository;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(new CreateSetRequestPayloadValidator(_createSetRepository));
    }
}

internal class CreateSetRequestPayloadValidator : AbstractValidator<CreateSetRequestPayload>
{
    private readonly ICreateSetRepository _createSetRepository;

    public CreateSetRequestPayloadValidator(ICreateSetRepository createSetRepository)
    {
        _createSetRepository = createSetRepository;

        AddValidationForSetName();
        AddValidationForEntries();
    }

    private void AddValidationForSetName()
    {
        RuleFor(request => request.SetName)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(AddValidationForSetNameUniqueness)
            .WithName(nameof(CreateSetCommand.SetName));
    }

    private void AddValidationForSetNameUniqueness()
    {
        RuleFor(request => request.SetName)
            .MustAsync(
                async (setName, cancellationToken) =>
                {
                    bool setWithNameExists =
                        await _createSetRepository.SetExistsAsync(setName, null, cancellationToken);

                    return !setWithNameExists;
                }
            )
            .WithName(nameof(CreateSetCommand.SetName))
            .WithMessage("'{PropertyName}' with the given name ('{PropertyValue}') exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForEntries()
    {
        RuleFor(request => request.Entries)
            .NotEmpty()
            .Must(
                entries =>
                {
                    List<string> distinctWords = entries.Select(x => x.Word).Distinct().ToList();

                    return distinctWords.Count == entries.Count;
                }
            )
            .WithMessage("'{PropertyName}' cannot contain repeated words.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
        RuleForEach(request => request.Entries).SetValidator(new EntryDtoValidator());
    }
}

internal class EntryDtoValidator : AbstractValidator<EntryDto>
{
    public EntryDtoValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
        AddValidationForTranslations();
        AddValidationForExampleSentences();
    }

    private void AddValidationForWord()
    {
        RuleFor(entry => entry.Word).NotEmpty().MaximumLength(200);
    }

    private void AddValidationForWordType()
    {
        RuleFor(entry => entry.WordType)
            .Must(WordTypes.IsCorrect)
            .WithName(nameof(EntryDto.WordType))
            .WithMessage($"'{{PropertyName}}' must be one of the following: {WordTypes.Serialize()}.")
            .WithErrorCode(ValidationErrorCodes.ValueInSetValidator);
    }

    private void AddValidationForTranslations()
    {
        RuleFor(entry => entry.Translations)
            .NotEmpty()
            .DependentRules(() => RuleForEach(entry => entry.Translations).NotEmpty().MaximumLength(200));
    }

    private void AddValidationForExampleSentences()
    {
        RuleForEach(entry => entry.ExampleSentences).NotEmpty().MaximumLength(500);
    }
}
