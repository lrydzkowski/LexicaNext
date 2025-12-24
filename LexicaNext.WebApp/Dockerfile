FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

FROM node:22 AS node-build
WORKDIR /src
COPY ["Frontend/lexica-next-front/package.json", "Frontend/lexica-next-front/package-lock.json*", "./"]
RUN npm ci
ENV VITE_OUTPUT_DIR=dist
COPY ["Frontend/lexica-next-front", "./"]
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["LexicaNext.Infrastructure/LexicaNext.Infrastructure.csproj", "LexicaNext.Infrastructure/"]
COPY ["LexicaNext.Core/LexicaNext.Core.csproj", "LexicaNext.Core/"]
COPY ["LexicaNext.WebApp/LexicaNext.WebApp.csproj", "LexicaNext.WebApp/"]
RUN dotnet restore "LexicaNext.WebApp/LexicaNext.WebApp.csproj"
COPY . .
RUN rm -rf /src/LexicaNext.WebApp/wwwroot/*
COPY --from=node-build /src/dist /src/LexicaNext.WebApp/wwwroot
WORKDIR "/src/LexicaNext.WebApp"
RUN dotnet build "LexicaNext.WebApp.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "LexicaNext.WebApp.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LexicaNext.WebApp.dll"]
