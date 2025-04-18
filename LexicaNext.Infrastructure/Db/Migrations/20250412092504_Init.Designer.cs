﻿// <auto-generated />
using System;
using LexicaNext.Infrastructure.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250412092504_Init")]
    partial class Init
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.RecordingEntity", b =>
                {
                    b.Property<Guid>("RecordingId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("recording_id");

                    b.Property<string>("FileName")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("file_name");

                    b.Property<string>("Word")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("word");

                    b.Property<Guid>("WordTypeId")
                        .HasColumnType("uuid")
                        .HasColumnName("word_type_id");

                    b.HasKey("RecordingId");

                    b.HasIndex("WordTypeId");

                    b.ToTable("recording", (string)null);
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.SetEntity", b =>
                {
                    b.Property<Guid>("SetId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("set_id");

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.HasKey("SetId");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("set", (string)null);
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.TranslationEntity", b =>
                {
                    b.Property<Guid>("TranslationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("translation_id");

                    b.Property<int>("Order")
                        .HasColumnType("integer")
                        .HasColumnName("order");

                    b.Property<string>("Translation")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("translation");

                    b.Property<Guid>("WordId")
                        .HasColumnType("uuid")
                        .HasColumnName("word_id");

                    b.HasKey("TranslationId");

                    b.HasIndex("WordId");

                    b.ToTable("translation", (string)null);
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.WordEntity", b =>
                {
                    b.Property<Guid>("WordId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("word_id");

                    b.Property<int>("Order")
                        .HasColumnType("integer")
                        .HasColumnName("order");

                    b.Property<Guid>("SetId")
                        .HasColumnType("uuid")
                        .HasColumnName("set_id");

                    b.Property<string>("Word")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("word");

                    b.Property<Guid>("WordTypeId")
                        .HasColumnType("uuid")
                        .HasColumnName("word_type_id");

                    b.HasKey("WordId");

                    b.HasIndex("SetId");

                    b.HasIndex("WordTypeId");

                    b.ToTable("word", (string)null);
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.WordTypeEntity", b =>
                {
                    b.Property<Guid>("WordTypeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("word_type_id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)")
                        .HasColumnName("name");

                    b.HasKey("WordTypeId");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("word_type", (string)null);

                    b.HasData(
                        new
                        {
                            WordTypeId = new Guid("0196294e-9a78-735e-9186-2607dbb3e33a"),
                            Name = "None"
                        },
                        new
                        {
                            WordTypeId = new Guid("0196294e-9a78-73b5-947e-fb739d73808c"),
                            Name = "Noun"
                        },
                        new
                        {
                            WordTypeId = new Guid("0196294e-9a78-74d8-8430-4ebdfd46cf68"),
                            Name = "Verb"
                        },
                        new
                        {
                            WordTypeId = new Guid("0196294e-9a78-7573-9db1-47b3d0ee9eae"),
                            Name = "Adjective"
                        },
                        new
                        {
                            WordTypeId = new Guid("0196294e-9a78-7e0a-b3b2-9c653699e41e"),
                            Name = "Adverb"
                        });
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.RecordingEntity", b =>
                {
                    b.HasOne("LexicaNext.Infrastructure.Db.Common.Entities.WordTypeEntity", "WordType")
                        .WithMany("Recordings")
                        .HasForeignKey("WordTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("WordType");
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.TranslationEntity", b =>
                {
                    b.HasOne("LexicaNext.Infrastructure.Db.Common.Entities.WordEntity", "Word")
                        .WithMany("Translations")
                        .HasForeignKey("WordId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Word");
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.WordEntity", b =>
                {
                    b.HasOne("LexicaNext.Infrastructure.Db.Common.Entities.SetEntity", "Set")
                        .WithMany("Words")
                        .HasForeignKey("SetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("LexicaNext.Infrastructure.Db.Common.Entities.WordTypeEntity", "WordType")
                        .WithMany("Words")
                        .HasForeignKey("WordTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Set");

                    b.Navigation("WordType");
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.SetEntity", b =>
                {
                    b.Navigation("Words");
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.WordEntity", b =>
                {
                    b.Navigation("Translations");
                });

            modelBuilder.Entity("LexicaNext.Infrastructure.Db.Common.Entities.WordTypeEntity", b =>
                {
                    b.Navigation("Recordings");

                    b.Navigation("Words");
                });
#pragma warning restore 612, 618
        }
    }
}
