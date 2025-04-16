class AppConfig {
  apiBasePath = this.getEnvironmentValue('VITE_API_BASE_PATH');

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
