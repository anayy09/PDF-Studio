import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Routes, useLocation } from 'react-router-dom';

interface AnimatedRoutesProps {
  children: React.ReactNode;
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ children }) => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.pathname}
        timeout={300}
        classNames="page-transition"
        unmountOnExit
      >
        <div style={{ width: '100%' }}>
          <Routes location={location}>
            {children}
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AnimatedRoutes;
