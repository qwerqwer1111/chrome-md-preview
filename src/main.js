import MarkdownIt from 'markdown-it';
import MarkdownItMathjax from 'markdown-it-mathjax';
import MarkdownItTaskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js/lib';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github-gist.css';
import './main.css';

const MATHJAX_CONFIG = {
  showMathMenu: false,
  showProcessingMessages: false,
  messageStyle: 'none',
  tex2jax: {
    inlineMath: [
      ['\\(', '\\)']
    ],
    displayMath: [
      ['\\[', '\\]']
    ],
    processEscapes: true
  },
  TeX: {
    Macros: {
      argmax: ['\\mathop{\\mathrm{argmax}}\\limits'],
      argmin: ['\\mathop{\\mathrm{argmin}}\\limits'],
    }
  }
};

function render(text) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return '';
    }
  })
    .use(new MarkdownItMathjax())
    .use(MarkdownItTaskLists);

  document.body.innerHTML = md.render(text);
  document.body.dispatchEvent(new CustomEvent('MarkdownUpdated'));
}

(() => {
  const mathjaxConfigScript = document.createElement('script');
  mathjaxConfigScript.setAttribute('type', 'text/x-mathjax-config');
  mathjaxConfigScript.innerHTML = `MathJax.Hub.Config(${JSON.stringify(MATHJAX_CONFIG)});`;
  document.head.appendChild(mathjaxConfigScript);

  const mathjaxScript = document.createElement('script');
  mathjaxScript.setAttribute('type', 'text/javascript');
  mathjaxScript.setAttribute(
    'src', chrome.extension.getURL('js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'));
  document.head.appendChild(mathjaxScript);

  const enqueueFn = () => {
    document.body.addEventListener('MarkdownUpdated', () => {
      if (typeof window.MathJax !== 'undefined' && typeof window.MathJax.Hub !== 'undefined') {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, document.body]);
      }
    });
  };

  const mathjaxUpdateScript = document.createElement('script');
  mathjaxUpdateScript.setAttribute('type', 'text/javascript');
  mathjaxUpdateScript.innerHTML = `(${enqueueFn.toString()})();`;
  document.head.appendChild(mathjaxUpdateScript);

  document.body.classList.add('markdown-body');

  let prevText = document.body.innerText;

  render(prevText);

  setInterval(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', location.href, true);
    xhr.onload = () => {
      const data = xhr.responseText;
      if (prevText === data) {
        return;
      }
      prevText = data;
      render(data);
    };
    xhr.send(null);
  }, 1000);
})();
