using FluentValidation;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

public class UpdateSetRequestValidator : AbstractValidator<UpdateSetRequest>
{
    private readonly IUpdateSetRepository _updateSetRepository;

    public UpdateSetRequestValidator(IUpdateSetRepository updateSetRepository)
    {
        _updateSetRepository = updateSetRepository;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(
                x =>
                {
                    Guid.TryParse(x.SetId, out Guid parsedSetId);

                    return new UpdateSetRequestPayloadValidator(parsedSetId, _updateSetRepository);
                }
            );
    }
}

internal class UpdateSetRequestPayloadValidator : AbstractValidator<UpdateSetRequestPayload>
{
    private readonly Guid _setId;
    private readonly IUpdateSetRepository _updateSetRepository;

    public UpdateSetRequestPayloadValidator(Guid setId, IUpdateSetRepository updateSetRepository)
    {
        _setId = setId;
        _updateSetRepository = updateSetRepository;

        AddValidationForSetName();
        AddValidationForEntries();
    }

    private void AddValidationForSetName()
    {
        RuleFor(request => request.SetName)
            .NotEmpty()
            .MaximumLength(200)
            .DependentRules(AddValidationForSetNameUniqueness)
            .WithName(nameof(UpdateSetRequestPayload.SetName));
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
                            _setId,
                            cancellationToken
                        );

                    return !setWithNameExists;
                }
            )
            .WithName(nameof(UpdateSetRequestPayload.SetName))
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
                    List<string> distinctWords = entries.Select(entry => entry.Word).Distinct().ToList();

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
