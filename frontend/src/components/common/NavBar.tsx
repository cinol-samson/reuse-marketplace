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

  const activeClass = 'text-clay-400 font-semibold border-b-2 border-clay-300 pb-1';
  const inactiveClass =
    'text-earth-100 hover:text-earth transition-colors pb-1 border-b-2 border-transparent';

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-xs border-b border-beige-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <SketchHeroReuse size={36} className="text-clay-300 group-hover:scale-105 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="font-heading text-h4 font-bold text-earth leading-none">
              {strings.app.name}
            </span>
            <span className="text-caption text-stone-400 hidden sm:inline">
              giving things second life
            </span>
          </div>
        </NavLink>

        {/* Top Navigation Links (Desktop First) */}
        <nav className="flex items-center gap-6 text-body-sm" aria-label="Main Navigation">
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
            className="text-caption px-2 py-1 rounded bg-beige-100 text-stone-500 hover:text-earth border border-beige-200"
            title="Design System & Style Guide"
          >
            Styleguide
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
