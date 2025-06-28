export interface IAppLink {
  path: string;
  url: string;
  label: string;
  segment: string;
}

export const links: Record<string, IAppLink> = {
  home: {
    path: '/',
    url: '/',
    label: 'Home',
    segment: '',
  },
  about: {
    path: 'about',
    url: '/about',
    label: 'About',
    segment: 'about',
  },
  signIn: {
    path: 'sign-in',
    url: '/sign-in',
    label: 'Sign In',
    segment: 'sign-in',
  },
  sets: {
    path: 'sets',
    url: '/sets',
    label: 'Sets',
    segment: 'sets',
  },
  newSet: {
    path: 'sets/new',
    url: '/sets/new',
    label: 'New Set',
    segment: 'new',
  },
  editSet: {
    path: 'sets/:setId/edit',
    url: '/sets/:setId/edit',
    label: 'Edit Set',
    segment: 'edit',
  },
  setContent: {
    path: 'sets/:setId/content',
    url: '/sets/:setId/content',
    label: 'Content',
    segment: 'content',
  },
  spellingMode: {
    path: 'sets/:setId/spelling-mode',
    url: '/sets/:setId/spelling-mode',
    label: 'Spelling Mode',
    segment: 'spelling-mode',
  },
  onlyOpenQuestionsMode: {
    path: 'sets/:setId/only-open-questions-mode',
    url: '/sets/:setId/only-open-questions-mode',
    label: 'Open Questions Mode',
    segment: 'only-open-questions-mode',
  },
  fullMode: {
    path: 'sets/:setId/full-mode',
    url: '/sets/:setId/full-mode',
    label: 'Full Mode',
    segment: 'full-mode',
  },
};
