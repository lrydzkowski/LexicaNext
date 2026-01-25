using FluentValidation;
using LexicaNext.Core.Commands.CreateSet.Interfaces;
using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Models;
using LexicaNext.Core.Queries.GetWord.Interfaces;

namespace LexicaNext.Core.Commands.CreateSet.Services;

public class CreateSetRequestValidator : AbstractValidator<CreateSetRequest>
{
    private readonly ICreateSetRepository _createSetRepository;
    private readonly IGetWordRepository _getWordRepository;
    private readonly IUserContextResolver _userContextResolver;

    public CreateSetRequestValidator(
        ICreateSetRepository createSetRepository,
        IGetWordRepository getWordRepository,
        IUserContextResolver userContextResolver
    )
    {
        _createSetRepository = createSetRepository;
        _getWordRepository = getWordRepository;
        _userContextResolver = userContextResolver;

        AddValidationForPayload();
    }

    private void AddValidationForPayload()
    {
        RuleFor(request => request.Payload!)
            .NotNull()
            .SetValidator(
                request =>
                {
                    string userId = _userContextResolver.GetUserId();
                    return new CreateSetRequestPayloadValidator(userId, _createSetRepository, _getWordRepository);
                }
            );
    }
}

internal class CreateSetRequestPayloadValidator : AbstractValidator<CreateSetRequestPayload>
{
    private readonly ICreateSetRepository _createSetRepository;
    private readonly IGetWordRepository _getWordRepository;
    private readonly string _userId;

    public CreateSetRequestPayloadValidator(
        string userId,
        ICreateSetRepository createSetRepository,
        IGetWordRepository getWordRepository
    )
    {
        _createSetRepository = createSetRepository;
        _getWordRepository = getWordRepository;
        _userId = userId;

        AddValidationForWordIds();
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
                        _userId,
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
