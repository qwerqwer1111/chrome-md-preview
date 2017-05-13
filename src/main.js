import 'github-markdown-css/github-markdown.css';
import hljs from 'highlight.js/lib';
import 'highlight.js/styles/github-gist.css';
import MarkdownIt from 'markdown-it';
import MarkdownItMathjax from 'markdown-it-mathjax';
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
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {
        }
      }
      return '';
    }
  }).use(new MarkdownItMathjax());

  $('#markdown').html(md.render(text));
  $('#markdown-update').text(new Date().getTime().toString());
}

(() => {
  let prevText = $(document.body).text();

  $(document.body).text('');

  $('<script>')
    .attr('type', 'text/x-mathjax-config')
    .html(`MathJax.Hub.Config(${JSON.stringify(MATHJAX_CONFIG)});`)
    .appendTo($(document.head));

  $('<script>')
    .attr('type', 'text/javascript')
    .attr('src', chrome.extension.getURL('js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'))
    .appendTo($(document.head));

  $('<div>')
    .attr('id', 'markdown')
    .addClass('markdown-body')
    .appendTo($(document.body));

  $('<div>')
    .attr('id', 'markdown-update')
    .hide()
    .appendTo($(document.body));

  const enqueueFn = () => {
    document.getElementById('markdown-update')
      .addEventListener('DOMSubtreeModified', () => {
        if ((typeof window.MathJax !== 'undefined')
          && (typeof window.MathJax.Hub !== 'undefined')) {
          window.MathJax.Hub.Queue([
            'Typeset',
            window.MathJax.Hub,
            document.getElementById('markdown')
          ]);
        }
      });
  };

  $('<script>')
    .attr('type', 'text/javascript')
    .html(`(${enqueueFn.toString()})()`)
    .appendTo($(document.body));

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
