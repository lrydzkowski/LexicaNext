import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import NotRequireAuth from './components/auth/NotRequireAuth';
import RequireAuth from './components/auth/RequireAuth';
import { Layout } from './components/layout/Layout';
import { PageWithBreadcrumbs } from './components/layout/PageWithBreadcrumbs';
import { links } from './config/links';
import { useSetLabel, useWordLabel } from './hooks/useBreadcrumbLabel';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SetFullModePage } from './pages/sets/modes/SetFullModePage';
import { SetOnlyOpenQuestionsModePage } from './pages/sets/modes/SetOnlyOpenQuestionsModePage';
import { SetSpellingModePage } from './pages/sets/modes/SetSpellingModePage';
import { SetContentPage } from './pages/sets/SetContentPage';
import { SetEditPage } from './pages/sets/SetEditPage';
import { SetNewPage } from './pages/sets/SetNewPage';
import { SetsPage } from './pages/sets/SetsPage';
import { SignInPage } from './pages/SignInPage';
import { WordEditPage } from './pages/words/WordEditPage';
import { WordNewPage } from './pages/words/WordNewPage';
import { WordsPage } from './pages/words/WordsPage';

export type BreadcrumbResolver = (id: string) => { label: string; isLoading: boolean };

export interface BreadcrumbResolverData {
  id: string;
  useResolver: BreadcrumbResolver;
}

export interface BreadcrumbItem {
  link?: string;
  label: string;
  resolver?: BreadcrumbResolverData;
}

export interface BreadcrumbHandle {
  breadcrumb: (params: Record<string, string | undefined>) => [BreadcrumbItem];
}

const router = createBrowserRouter([
  {
    path: '/',
    handle: {
      breadcrumb: () => [{ link: links.home.getUrl(), label: 'Home' }],
    },
    element: <Layout />,
    children: [
      {
        path: 'sign-in',
        element: (
          <NotRequireAuth>
            <SignInPage />
          </NotRequireAuth>
        ),
      },
      {
        index: true,
        element: (
          <RequireAuth>
            <Navigate to="/sets" replace />
          </RequireAuth>
        ),
      },
      {
        path: 'about',
        handle: {
          breadcrumb: () => [{ link: links.about.getUrl(), label: 'About' }],
        },
        element: (
          <RequireAuth>
            <PageWithBreadcrumbs>
              <AboutPage />
            </PageWithBreadcrumbs>
          </RequireAuth>
        ),
      },
      {
        path: 'sets',
        handle: {
          breadcrumb: () => [{ link: links.sets.getUrl(), label: 'Sets' }],
        },
        children: [
          {
            index: true,
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetsPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: 'new',
            handle: {
              breadcrumb: () => [{ link: links.newSet.getUrl(), label: 'New Set' }],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetNewPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':setId/edit',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.setId ?? '',
                  resolver: { id: params.setId, useResolver: useSetLabel },
                },
                {
                  link: links.editSet.getUrl({ setId: params.setId }),
                  label: 'Edit Set',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetEditPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':setId/content',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.setId ?? '',
                  resolver: { id: params.setId, useResolver: useSetLabel },
                },
                {
                  link: links.setContent.getUrl({ setId: params.setId }),
                  label: 'Content',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetContentPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':setId/spelling-mode',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.setId ?? '',
                  resolver: { id: params.setId, useResolver: useSetLabel },
                },
                {
                  link: links.spellingMode.getUrl({ setId: params.setId }),
                  label: 'Spelling Mode',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetSpellingModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':setId/open-questions-mode',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.setId ?? '',
                  resolver: { id: params.setId, useResolver: useSetLabel },
                },
                {
                  link: links.openQuestionsMode.getUrl({ setId: params.setId }),
                  label: 'Open Questions Mode',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetOnlyOpenQuestionsModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':setId/full-mode',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.setId ?? '',
                  resolver: { id: params.setId, useResolver: useSetLabel },
                },
                {
                  link: links.fullMode.getUrl({ setId: params.setId }),
                  label: 'Full Mode',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <SetFullModePage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
        ],
      },
      {
        path: 'words',
        handle: {
          breadcrumb: () => [{ link: links.words.getUrl(), label: 'Words' }],
        },
        children: [
          {
            index: true,
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <WordsPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: 'new',
            handle: {
              breadcrumb: () => [{ link: links.newWord.getUrl(), label: 'New Word' }],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <WordNewPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
          {
            path: ':wordId/edit',
            handle: {
              breadcrumb: (params: Record<string, string | undefined>) => [
                {
                  label: params.wordId ?? '',
                  resolver: { id: params.wordId, useResolver: useWordLabel },
                },
                {
                  link: links.editWord.getUrl({ wordId: params.wordId }),
                  label: 'Edit Word',
                },
              ],
            },
            element: (
              <RequireAuth>
                <PageWithBreadcrumbs>
                  <WordEditPage />
                </PageWithBreadcrumbs>
              </RequireAuth>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
