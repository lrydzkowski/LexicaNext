using System.Globalization;
using LexicaNext.Core;
using LexicaNext.Core.Commands.CreateSet;
using LexicaNext.Core.Commands.DeleteSet;
using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.Core.Queries.GetAppStatus;
using LexicaNext.Core.Queries.GetRecording;
using LexicaNext.Core.Queries.GetSet;
using LexicaNext.Core.Queries.GetSets;
using LexicaNext.Infrastructure;
using LexicaNext.WebApp;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddWebAppServices();
builder.Services.AddCoreServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

CultureInfo culture = new("en-US");
CultureInfo.DefaultThreadCurrentCulture = culture;
CultureInfo.DefaultThreadCurrentUICulture = culture;

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => { options.SwaggerEndpoint("/openapi/v1.json", "v1"); });
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
app.MapRegisterAnswerEndpoint();

app.MapFallbackToFile("index.html");

app.Run();

public partial class Program
{
}
