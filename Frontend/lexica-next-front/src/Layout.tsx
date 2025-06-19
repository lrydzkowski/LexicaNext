import { NavLink, Outlet } from 'react-router';

import './Layout.css';

export function Layout() {
  return (
    <>
      <h1>Lexica Next</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/sign-in">Sign In</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            <NavLink to="/sets">Sets</NavLink>
          </li>
          <li>
            <NavLink to="/sets/new">New Set</NavLink>
          </li>
          <li>
            <NavLink to="/sets/1/edit">Edit Set 1</NavLink>
          </li>
          <li>
            <NavLink to="/sets/1/spelling-mode">Set 1 Spelling Mode</NavLink>
          </li>
          <li>
            <NavLink to="/sets/1/full-mode">Set 1 Full Mode</NavLink>
          </li>
          <li>
            <NavLink to="/sets/1/only-open-questions-mode">Set 1 Only Open Questions Mode</NavLink>
          </li>
          <li>
            <NavLink to="/sets/1/content">Set 1 Content</NavLink>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
