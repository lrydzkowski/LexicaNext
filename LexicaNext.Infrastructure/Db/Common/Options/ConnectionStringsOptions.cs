﻿namespace LexicaNext.Infrastructure.Db.Common.Options;

internal class ConnectionStringsOptions
{
    public const string Position = "ConnectionStrings";

    public string? AppPostgresDb { get; set; }
}
