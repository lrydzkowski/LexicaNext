class AppConfig {
  apiBasePath = this.getEnvironmentValue('VITE_API_BASE_PATH');

  auth0Domain = this.getEnvironmentValue('VITE_AUTH0_DOMAIN');
  auth0ClientId = this.getEnvironmentValue('VITE_AUTH0_CLIENT_ID');

  private getEnvironmentValue(key: string): string {
    const value: unknown = import.meta.env[key];
    if (!value) {
      console.warn(`Environment variable ${key} is not defined`);
    }

    return (value || '') as string;
  }
}

const appConfig = new AppConfig();
export default appConfig;
