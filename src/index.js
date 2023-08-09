// index.js
// import './index.css';
import { fetchCharacters, loadCharacters } from './modules/loadCharacters.js';
import myDateTime from './modules/date-time.js';

document.addEventListener('DOMContentLoaded', () => {
  myDateTime();
  fetchCharacters();
  loadCharacters();
});
