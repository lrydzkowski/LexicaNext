using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class WordEntityTypeConfiguration : IEntityTypeConfiguration<WordEntity>
{
    public void Configure(EntityTypeBuilder<WordEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureRelations(builder);
        ConfigureColumns(builder);
    }

    private void SetTableName(EntityTypeBuilder<WordEntity> builder)
    {
        builder.ToTable(WordEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<WordEntity> builder)
    {
        builder.HasKey(entity => entity.WordId);
    }

    private void ConfigureRelations(EntityTypeBuilder<WordEntity> builder)
    {
        ConfigureRelationWithWordType(builder);
        ConfigureRelationWithSet(builder);
    }

    private static void ConfigureRelationWithWordType(EntityTypeBuilder<WordEntity> builder)
    {
        builder.HasOne(entity => entity.WordType)
            .WithMany(parent => parent.Words)
            .HasForeignKey(entity => entity.WordTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureRelationWithSet(EntityTypeBuilder<WordEntity> builder)
    {
        builder.HasOne(entity => entity.Set)
            .WithMany(parent => parent.Words)
            .HasForeignKey(entity => entity.SetId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureColumns(EntityTypeBuilder<WordEntity> builder)
    {
        builder.Property(entity => entity.WordId)
            .HasColumnName("word_id")
            .IsRequired();

        builder.Property(entity => entity.Word)
            .HasColumnName("word")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(entity => entity.WordTypeId)
            .HasColumnName("word_type_id")
            .IsRequired();

        builder.Property(entity => entity.Order)
            .HasColumnName("order")
            .IsRequired();

        builder.Property(entity => entity.SetId)
            .HasColumnName("set_id")
            .IsRequired();
    }
}
