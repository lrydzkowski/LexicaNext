using FluentValidation;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

internal class UpdateSetCommandValidator : AbstractValidator<UpdateSetRequest>
{
    private readonly IValidator<EntryDto> _entryDtoValidator;
    private readonly IUpdateSetRepository _updateSetRepository;

    public UpdateSetCommandValidator(IUpdateSetRepository updateSetRepository, IValidator<EntryDto> entryDtoValidator)
    {
        _updateSetRepository = updateSetRepository;
        _entryDtoValidator = entryDtoValidator;

        AddValidationForSetId();
        AddValidationForSetName();
        AddValidationForEntries();
    }

    private void AddValidationForSetId()
    {
        RuleFor(request => request.SetId)
            .MustAsync(
                async (setId, cancellationToken) => await _updateSetRepository.SetExistsAsync(setId, cancellationToken)
            )
            .WithName(nameof(UpdateSetRequest.SetId))
            .WithMessage("Set with the given id ('{PropertyValue}') doesn't exist.")
            .WithErrorCode(ValidationErrorCodes.ExistenceValidator);
    }

    private void AddValidationForSetName()
    {
        RuleFor(request => request.SetName)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(AddValidationForSetNameUniqueness)
            .WithName(nameof(UpdateSetRequest.SetName));
    }

    private void AddValidationForSetNameUniqueness()
    {
        RuleFor(request => request)
            .MustAsync(
                async (updateSetRequest, cancellationToken) =>
                {
                    bool setWithNameExists =
                        await _updateSetRepository.SetExistsAsync(
                            updateSetRequest.SetName,
                            updateSetRequest.SetId,
                            cancellationToken
                        );

                    return !setWithNameExists;
                }
            )
            .WithName(nameof(UpdateSetRequest.SetName))
            .WithMessage("'{PropertyName}' with the given name ('{PropertyValue}') exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
        ;
    }

    private void AddValidationForEntries()
    {
        RuleFor(request => request.Entries)
            .NotEmpty()
            .Must(
                entries =>
                {
                    List<string> distinctWords = entries.Select(entry => entry.Word).Distinct().ToList();

                    return distinctWords.Count == entries.Count;
                }
            )
            .WithMessage("'{PropertyName}' cannot contain repeated words.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
        RuleForEach(request => request.Entries).SetValidator(_entryDtoValidator);
    }
}

public class EntryDtoValidator : AbstractValidator<EntryDto>
{
    public EntryDtoValidator()
    {
        AddValidationForWord();
        AddValidationForWordType();
        AddValidationForTranslations();
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
}
