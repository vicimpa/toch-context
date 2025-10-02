import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;

addEventListener('contextmenu', e => e.preventDefault());
addEventListener('dragstart', e => e.preventDefault());
addEventListener('wheel', e => e.preventDefault());
addEventListener('gesturestart', e => e.preventDefault());
addEventListener('touchend', e => e.preventDefault());