using FluentValidation;
using LexicaNext.Core.Commands.UpdateSet.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

public class UpdateSetRequestValidator : AbstractValidator<UpdateSetRequest>
{
    private readonly IUpdateSetRepository _updateSetRepository;
    private readonly IGetWordRepository _getWordRepository;

    public UpdateSetRequestValidator(
        IUpdateSetRepository updateSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _updateSetRepository = updateSetRepository;
        _getWordRepository = getWordRepository;

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

                    return new UpdateSetRequestPayloadValidator(parsedSetId, _updateSetRepository, _getWordRepository);
                }
            );
    }
}

internal class UpdateSetRequestPayloadValidator : AbstractValidator<UpdateSetRequestPayload>
{
    private readonly Guid _setId;
    private readonly IUpdateSetRepository _updateSetRepository;
    private readonly IGetWordRepository _getWordRepository;

    public UpdateSetRequestPayloadValidator(
        Guid setId,
        IUpdateSetRepository updateSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _setId = setId;
        _updateSetRepository = updateSetRepository;
        _getWordRepository = getWordRepository;

        AddValidationForSetName();
        AddValidationForWordIds();
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
            .WithMessage(x => $"'{{PropertyName}}' with the given name ('{x.SetName}') exists.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);
    }

    private void AddValidationForWordIds()
    {
        RuleFor(request => request.WordIds)
            .NotEmpty()
            .Must(
                wordIds =>
                {
                    List<string> distinctWordIds = wordIds.Distinct().ToList();

                    return distinctWordIds.Count == wordIds.Count;
                }
            )
            .WithMessage("'{PropertyName}' cannot contain duplicate word IDs.")
            .WithErrorCode(ValidationErrorCodes.UniquenessValidator);

        RuleForEach(request => request.WordIds)
            .Must(wordId => Guid.TryParse(wordId, out _))
            .WithMessage("'{PropertyValue}' is not a valid word ID format.");

        RuleFor(request => request.WordIds)
            .MustAsync(
                async (wordIds, cancellationToken) =>
                {
                    List<Guid> parsedIds = wordIds
                        .Where(id => Guid.TryParse(id, out _))
                        .Select(Guid.Parse)
                        .ToList();

                    if (parsedIds.Count != wordIds.Count)
                    {
                        return true;
                    }

                    List<Guid> existingIds = await _getWordRepository.GetExistingWordIdsAsync(
                        parsedIds,
                        cancellationToken
                    );

                    return existingIds.Count == parsedIds.Count;
                }
            )
            .WithMessage("One or more word IDs do not exist.")
            .WithErrorCode(ValidationErrorCodes.ExistenceValidator);
    }
}
