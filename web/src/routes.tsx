import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import NewLocation from './pages/NewLocation';

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact />
            <Route component={NewLocation} path="/newlocation" />
        </BrowserRouter>
    );
}

export default Routes;
