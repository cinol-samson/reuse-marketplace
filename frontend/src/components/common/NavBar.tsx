import React from 'react';
import { NavLink } from 'react-router-dom';
import { strings } from '../../strings';
import { SketchHeroReuse } from '../sketches/SketchIcons';
import { useAuth } from '../../context/AuthContext';

export const NavBar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const coreNavItems = [
    { to: '/', label: strings.nav.home },
    { to: '/nearby', label: strings.nav.nearby },
    { to: '/artist-posts', label: strings.nav.artistPosts },
  ];

  const authNavItems = isAuthenticated
    ? [
        { to: '/items/new', label: strings.nav.postItem },
        { to: '/inbox', label: strings.nav.inbox },
        { to: '/notifications', label: strings.nav.notifications },
        { to: '/profile', label: strings.nav.profile },
      ]
    : [
        { to: '/login', label: 'Sign in' },
        { to: '/register', label: 'Register' },
      ];

  const navItems = [...coreNavItems, ...authNavItems];

  const activeClass =
    'text-clay-400 font-semibold border-b-2 border-clay-300 pb-1 transition-colors';
  const inactiveClass =
    'text-earth-100 hover:text-earth transition-colors pb-1 border-b-2 border-transparent';

  return (
    <header className="sticky top-0 z-40 border-b border-beige-200 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-beige-200 bg-beige-50 text-clay-300 shadow-paper transition-transform group-hover:scale-105">
            <SketchHeroReuse size={28} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading text-h4 font-bold leading-none text-earth">
              {strings.app.name}
            </span>
            <span className="hidden text-caption text-stone-400 sm:inline">
              giving things second life
            </span>
          </div>
        </NavLink>

        <nav aria-label="Main navigation" className="flex items-center gap-5 text-body-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/styleguide"
            className="rounded bg-beige-100 px-2 py-1 text-caption text-stone-500 transition-colors hover:text-earth"
          >
            Styleguide
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
