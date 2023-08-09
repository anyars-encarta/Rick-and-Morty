// index.js
//import './index.css';
import { fetchCharacters } from './modules/loadCharacters.js';
import { loadCharacters } from './modules/loadCharacters.js';
import myDateTime from './modules/date-time.js';


document.addEventListener('DOMContentLoaded', () => {
  myDateTime();
  fetchCharacters ();
  loadCharacters();
});
