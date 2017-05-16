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
        } catch (__) {
        }
      }
      return '';
    }
  })
    .use(new MarkdownItMathjax())
    .use(MarkdownItTaskLists);

  $(document.body).html(md.render(text));
  document.body.dispatchEvent(new CustomEvent('MarkdownUpdated'));
}

(() => {
  $('<script>')
    .attr('type', 'text/x-mathjax-config')
    .html(`MathJax.Hub.Config(${JSON.stringify(MATHJAX_CONFIG)});`)
    .appendTo($(document.head));

  $('<script>')
    .attr('type', 'text/javascript')
    .attr('src', chrome.extension.getURL('js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'))
    .appendTo($(document.head));

  const enqueueFn = () => {
    document.body.addEventListener('MarkdownUpdated', () => {
      if ((typeof window.MathJax !== 'undefined')
        && (typeof window.MathJax.Hub !== 'undefined')) {
        window.MathJax.Hub.Queue([
          'Typeset',
          window.MathJax.Hub,
          document.body
        ]);
      }
    });
  };

  $('<script>')
    .attr('type', 'text/javascript')
    .html(`(${enqueueFn.toString()})()`)
    .appendTo($(document.head));

  $(document.body).addClass('markdown-body');

  let prevText = $(document.body).text();

  render(prevText);

  setInterval(() => {
    $.get(location.href, data => {
      if (prevText === data) {
        return;
      }
      prevText = data;
      render(data);
    });
  }, 1000);
})();
