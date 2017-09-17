import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';

import App from './App';

it('renders without crashing', () => {
	shallow(<App />);
});