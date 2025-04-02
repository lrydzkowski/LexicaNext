using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LexicaNext.Infrastructure.Db.Common.Configurations;

internal class SetEntityTypeConfiguration : IEntityTypeConfiguration<SetEntity>
{
    public void Configure(EntityTypeBuilder<SetEntity> builder)
    {
        SetTableName(builder);
        SetPrimaryKey(builder);
        ConfigureColumns(builder);
    }

    private void SetTableName(EntityTypeBuilder<SetEntity> builder)
    {
        builder.ToTable(SetEntity.TableName);
    }

    private void SetPrimaryKey(EntityTypeBuilder<SetEntity> builder)
    {
        builder.HasKey(entity => entity.SetId);
    }

    private void ConfigureColumns(EntityTypeBuilder<SetEntity> builder)
    {
        builder.Property(entity => entity.SetId)
            .HasColumnName("set_id")
            .IsRequired();

        builder.Property(entity => entity.Name)
            .HasColumnName("name")
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(entity => entity.Name)
            .IsUnique();

        builder.Property(entity => entity.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();
    }
}
