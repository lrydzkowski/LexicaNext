FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["LexicaNext.Infrastructure/LexicaNext.Infrastructure.csproj", "LexicaNext.Infrastructure/"]
COPY ["LexicaNext.Core/LexicaNext.Core.csproj", "LexicaNext.Core/"]
COPY ["LexicaNext.WebApp/LexicaNext.WebApp.csproj", "LexicaNext.WebApp/"]
RUN dotnet restore "LexicaNext.WebApp/LexicaNext.WebApp.csproj"
COPY . .
WORKDIR "/src/LexicaNext.WebApp"
RUN dotnet build "LexicaNext.WebApp.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "LexicaNext.WebApp.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LexicaNext.WebApp.dll"]
