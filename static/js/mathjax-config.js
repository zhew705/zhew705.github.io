// See https://docs.mathjax.org/en/latest/index.html for more details.
MathJax = {
    tex: {
        packages: {},
        inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
        ],
        displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]']
        ],
        processEscapes: false,
        processEnvironments: true,
        processRefs: true,
        digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
        tags: 'all',
        tagSide: 'right',
        tagIndent: '0.8em',
        useLabelIds: true,
        maxMacros: 10000,
        maxBuffer: 5 * 1024,
        formatError: (jax, err) => jax.formatError(err)
    }
};
