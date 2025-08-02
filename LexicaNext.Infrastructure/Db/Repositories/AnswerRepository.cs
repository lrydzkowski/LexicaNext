using LexicaNext.Core.Commands.RegisterAnswer.Interface;
using LexicaNext.Core.Commands.RegisterAnswer.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Services;
using LexicaNext.Infrastructure.Db.Common.Entities;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class AnswerRepository : IScopedService, IRegisterAnswerRepository
{
    private readonly IDateTimeOffsetProvider _dateTimeOffsetProvider;
    private readonly AppDbContext _dbContext;

    public AnswerRepository(AppDbContext dbContext, IDateTimeOffsetProvider dateTimeOffsetProvider)
    {
        _dbContext = dbContext;
        _dateTimeOffsetProvider = dateTimeOffsetProvider;
    }

    public async Task RegisterAnswerAsync(RegisterAnswerCommand registerAnswerCommand)
    {
        AnswerEntity answerEntity = new()
        {
            AnswerId = Guid.CreateVersion7(),
            Question = registerAnswerCommand.Question,
            GivenAnswer = registerAnswerCommand.GivenAnswer,
            ExpectedAnswer = registerAnswerCommand.ExpectedAnswer,
            AnsweredAt = _dateTimeOffsetProvider.UtcNow
        };
        _dbContext.Answers.Add(answerEntity);
        await _dbContext.SaveChangesAsync();
    }
}
