using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class ExampleSentenceEntityTypeConfiguration : IEntityTypeConfiguration<ExampleSentenceEntity>
{
    public void Configure(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureRelations(builder);
        ConfigureColumns(builder);
    }

    private static void SetTableName(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        builder.ToTable(ExampleSentenceEntity.TableName);
    }

    private static void SetPrimaryKey(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        builder.HasKey(entity => entity.ExampleSentenceId);
    }

    private static void ConfigureRelations(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        ConfigureRelationWithWord(builder);
    }

    private static void ConfigureRelationWithWord(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        builder.HasOne(entity => entity.Word)
            .WithMany(parent => parent.ExampleSentences)
            .HasForeignKey(entity => entity.WordId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureColumns(EntityTypeBuilder<ExampleSentenceEntity> builder)
    {
        builder.Property(entity => entity.ExampleSentenceId)
            .HasColumnName("example_sentence_id")
            .IsRequired();

        builder.Property(entity => entity.Sentence)
            .HasColumnName("sentence")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(entity => entity.Order)
            .HasColumnName("order")
            .IsRequired();

        builder.Property(entity => entity.WordId)
            .HasColumnName("word_id")
            .IsRequired();

        builder.HasIndex(entity => entity.WordId);
    }
}
