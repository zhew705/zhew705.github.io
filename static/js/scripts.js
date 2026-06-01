

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']

const allowedTags = new Set([
    'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'LI', 'OL',
    'P', 'PRE', 'S', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY',
    'TD', 'TH', 'THEAD', 'TR', 'UL'
]);

const globalAttributes = new Set(['class', 'title']);
const tagAttributes = {
    A: new Set(['href', 'target', 'rel']),
    IMG: new Set(['src', 'alt', 'title', 'width', 'height'])
};

function isSafeUrl(value, allowedProtocols) {
    const trimmed = value.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
        return true;
    }

    try {
        const url = new URL(trimmed, document.baseURI);
        return allowedProtocols.has(url.protocol);
    } catch {
        return false;
    }
}

function sanitizeHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html);

    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
    const elements = [];
    while (walker.nextNode()) {
        elements.push(walker.currentNode);
    }

    elements.forEach(element => {
        if (!allowedTags.has(element.tagName)) {
            if (['SCRIPT', 'STYLE', 'TEMPLATE'].includes(element.tagName)) {
                element.remove();
            } else {
                element.replaceWith(...element.childNodes);
            }
            return;
        }

        [...element.attributes].forEach(attribute => {
            const name = attribute.name.toLowerCase();
            const allowedForTag = tagAttributes[element.tagName] || new Set();
            const allowed = globalAttributes.has(name) || allowedForTag.has(name);

            if (!allowed || name.startsWith('on')) {
                element.removeAttribute(attribute.name);
                return;
            }

            if (name === 'href' && !isSafeUrl(attribute.value, new Set(['http:', 'https:', 'mailto:', 'tel:']))) {
                element.removeAttribute(attribute.name);
            }

            if (name === 'src' && !isSafeUrl(attribute.value, new Set(['http:', 'https:']))) {
                element.removeAttribute(attribute.name);
            }

            if (name === 'target' && attribute.value !== '_blank') {
                element.removeAttribute(attribute.name);
            }
        });

        if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
            element.setAttribute('rel', 'noopener noreferrer');
        }
    });

    return template.innerHTML;
}


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = sanitizeHtml(yml[key] ?? '');
                } catch {
                    console.log("Unknown id and value: " + key + "," + String(yml[key] ?? ''))
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = sanitizeHtml(html);
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
