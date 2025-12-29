export interface IAppLink {
  getUrl: (
    params?: Record<string, string | undefined> | null,
    query?: Record<string, string | undefined> | null,
  ) => string;
}

export const links: Record<string, IAppLink> = {
  home: {
    getUrl: () => '/',
  },
  about: {
    getUrl: (_, query) => {
      let url = '/about';
      url = addQuery(url, query);

      return url;
    },
  },
  signIn: {
    getUrl: (_, query) => {
      let url = '/sign-in';
      url = addQuery(url, query);

      return url;
    },
  },
  sets: {
    getUrl: (_, query) => {
      let url = '/sets';
      url = addQuery(url, query);

      return url;
    },
  },
  newSet: {
    getUrl: (_, query) => {
      let url = '/sets/new';
      url = addQuery(url, query);

      return url;
    },
  },
  editSet: {
    getUrl: (params, query) => {
      let url = `/sets/${params?.setId}/edit`;
      url = addQuery(url, query);

      return url;
    },
  },
  setContent: {
    getUrl: (params, query) => {
      let url = `/sets/${params?.setId}/content`;
      url = addQuery(url, query);

      return url;
    },
  },
  spellingMode: {
    getUrl: (params, query) => {
      let url = `/sets/${params?.setId}/spelling-mode`;
      url = addQuery(url, query);

      return url;
    },
  },
  openQuestionsMode: {
    getUrl: (params, query) => {
      let url = `/sets/${params?.setId}/open-questions-mode`;
      url = addQuery(url, query);

      return url;
    },
  },
  fullMode: {
    getUrl: (params, query) => {
      let url = `/sets/${params?.setId}/full-mode`;
      url = addQuery(url, query);

      return url;
    },
  },
  words: {
    getUrl: (_, query) => {
      let url = '/words';
      url = addQuery(url, query);

      return url;
    },
  },
  newWord: {
    getUrl: (_, query) => {
      let url = '/words/new';
      url = addQuery(url, query);

      return url;
    },
  },
  editWord: {
    getUrl: (params, query) => {
      let url = `/words/${params?.wordId}/edit`;
      url = addQuery(url, query);

      return url;
    },
  },
};

const addQuery = (url: string, query: Record<string, string | undefined> | null | undefined): string => {
  if (!query) {
    return url;
  }

  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
    .join('&');
  const urlWithQuery = `${url}?${queryString}`;

  return urlWithQuery;
};
