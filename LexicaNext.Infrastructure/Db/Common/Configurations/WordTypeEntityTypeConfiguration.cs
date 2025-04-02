using LexicaNext.Core.Common.Models;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class WordTypeEntityTypeConfiguration : IEntityTypeConfiguration<WordTypeEntity>
{
    public void Configure(EntityTypeBuilder<WordTypeEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureColumns(builder);
        InitData(builder);
    }

    private void SetTableName(EntityTypeBuilder<WordTypeEntity> builder)
    {
        builder.ToTable(WordTypeEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<WordTypeEntity> builder)
    {
        builder.HasKey(entity => entity.WordTypeId);
    }

    private void ConfigureColumns(EntityTypeBuilder<WordTypeEntity> builder)
    {
        builder.Property(entity => entity.WordTypeId)
            .HasColumnName("word_type_id")
            .IsRequired();

        builder.Property(entity => entity.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(entity => entity.Name)
            .IsUnique();
    }

    private void InitData(EntityTypeBuilder<WordTypeEntity> builder)
    {
        builder.HasData(
            new WordTypeEntity
            {
                WordTypeId = Guid.CreateVersion7(),
                Name = WordType.None.ToString()
            },
            new WordTypeEntity
            {
                WordTypeId = Guid.CreateVersion7(),
                Name = WordType.Noun.ToString()
            },
            new WordTypeEntity
            {
                WordTypeId = Guid.CreateVersion7(),
                Name = WordType.Verb.ToString()
            },
            new WordTypeEntity
            {
                WordTypeId = Guid.CreateVersion7(),
                Name = WordType.Adjective.ToString()
            },
            new WordTypeEntity
            {
                WordTypeId = Guid.CreateVersion7(),
                Name = WordType.Adverb.ToString()
            }
        );
    }
}
