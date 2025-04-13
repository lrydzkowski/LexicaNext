using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal interface IWordTypesRepository
{
    Task<Guid?> GetWordTypeIdAsync(WordType wordType, CancellationToken cancellationToken = default);
}

internal class WordTypesRepository : IScopedService, IWordTypesRepository
{
    private readonly AppDbContext _dbContext;

    public WordTypesRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid?> GetWordTypeIdAsync(WordType wordType, CancellationToken cancellationToken = default)
    {
        Guid? wordTypeId = await _dbContext.WordTypes
            .Where(wordTypeEntity => wordTypeEntity.Name == wordType.ToString())
            .Select(wordTypeEntity => wordTypeEntity.WordTypeId)
            .FirstOrDefaultAsync(cancellationToken);

        return wordTypeId;
    }
}
