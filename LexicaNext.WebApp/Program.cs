using LexicaNext.Core;
using LexicaNext.Core.Commands.CreateSet;
using LexicaNext.Core.Commands.DeleteSet;
using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.Core.Queries.GetAppStatus;
using LexicaNext.Core.Queries.GetRecording;
using LexicaNext.Core.Queries.GetSet;
using LexicaNext.Core.Queries.GetSets;
using LexicaNext.Infrastructure;
using LexicaNext.WebApp;
using Scalar.AspNetCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddWebAppServices();
builder.Services.AddCoreServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseStaticFiles();

app.MapGetAppStatusEndpoint();
app.MapGetSetEndpoint();
app.MapGetSetsEndpoint();
app.MapCreateSetEndpoint();
app.MapDeleteSetEndpoint();
app.MapUpdateSetEndpoint();
app.MapGetRecordingEndpoint();

app.MapFallbackToFile("index.html");

app.Run();
