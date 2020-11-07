import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';
import katex from 'katex';
import texmath from 'markdown-it-texmath';
import './main.css';

const options = {
  html: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return '';
  },
};

const md = new MarkdownIt(options).use(taskLists).use(texmath, {
  engine: katex,
  delimiters: 'dollars',
});

(() => {
  document.body.classList.add('markdown-body');
  let prev = document.body.innerText;
  document.body.innerHTML = md.render(prev);
  setInterval(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', location.href, true);
    xhr.onload = () => {
      const text = xhr.responseText;
      if (prev === text) {
        return;
      }
      prev = text;
      document.body.innerHTML = md.render(text);
    };
    xhr.send();
  }, 1000);
})();
