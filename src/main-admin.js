import { h } from 'preact';
import { mount } from './auth.js';
import Admin from './admin/Admin.js';
import './styles/ds/tokens.css';
import './styles/admin.css';

mount(h(Admin, null));
