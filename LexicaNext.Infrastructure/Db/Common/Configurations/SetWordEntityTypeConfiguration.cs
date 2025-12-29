using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class SetWordEntityTypeConfiguration : IEntityTypeConfiguration<SetWordEntity>
{
    public void Configure(EntityTypeBuilder<SetWordEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureRelations(builder);
        ConfigureColumns(builder);
        ConfigureIndexes(builder);
    }

    private void SetTableName(EntityTypeBuilder<SetWordEntity> builder)
    {
        builder.ToTable(SetWordEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<SetWordEntity> builder)
    {
        builder.HasKey(entity => new { entity.SetId, entity.WordId });
    }

    private void ConfigureRelations(EntityTypeBuilder<SetWordEntity> builder)
    {
        builder.HasOne(entity => entity.Set)
            .WithMany(parent => parent.SetWords)
            .HasForeignKey(entity => entity.SetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(entity => entity.Word)
            .WithMany(parent => parent.SetWords)
            .HasForeignKey(entity => entity.WordId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void ConfigureColumns(EntityTypeBuilder<SetWordEntity> builder)
    {
        builder.Property(entity => entity.SetId)
            .HasColumnName("set_id")
            .IsRequired();

        builder.Property(entity => entity.WordId)
            .HasColumnName("word_id")
            .IsRequired();

        builder.Property(entity => entity.Order)
            .HasColumnName("order")
            .IsRequired();
    }

    private void ConfigureIndexes(EntityTypeBuilder<SetWordEntity> builder)
    {
        builder.HasIndex(entity => new { entity.SetId, entity.Order });
    }
}
