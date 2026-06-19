/**
 * winbox-7css-compat.js
 *
 * Drop-in compatibility layer so WinBox.js windows render with 7.css
 * (Windows 7 / Aero) styling instead of WinBox's default skin.
 *
 * Load order:
 *   1. 7.css stylesheet
 *   2. winbox.js (the library)
 *   3. this file
 *
 * Usage afterwards — just use WinBox as normal:
 *   new WinBox({ title: "Hello", html: "<p>hi</p>" });
 *
 * Optional extra options this layer adds on top of normal WinBox options:
 *   glass: true        -> adds 7.css's frosted-glass title bar variant
 *   active: false      -> omit the 7.css "active" (focused) styling on create
 */
(function () {
    'use strict';

    if (typeof WinBox === 'undefined') {
        console.error('[winbox-7css-compat] WinBox.js must be loaded before this file.');
        return;
    }

    // ---------------------------------------------------------------
    // 1. Inject CSS overrides needed to reconcile WinBox's inline
    //    sizing logic with 7.css's title-bar/window-body assumptions.
    // ---------------------------------------------------------------
    var HEADER_HEIGHT = 30; // adjust if your 7.css build uses a different title-bar height

    var style = document.createElement('style');
    style.id = 'winbox-7css-compat-style';
    style.textContent = [
        '.winbox.window { max-width: none !important; max-height: none !important; }',
        '.winbox .wb-header.title-bar { height: 100% !important; line-height: normal !important; padding: 0; }',
        '.winbox .wb-header.title-bar .title-bar-text { display: flex; align-items: center; overflow: hidden; }',
        '.winbox .wb-body.window-body { position: absolute; left: 0; right: 0; bottom: 0; top: ' + HEADER_HEIGHT + 'px !important; margin: 0; overflow: auto; }',
        '.winbox .wb-icon { width: 16px; height: 16px; margin-right: 4px; flex: 0 0 auto; background-size: contain; display: none; }',
        '.winbox .wb-icon[style*="background-image"] { display: inline-block; }',
        '.winbox .wb-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
        '.winbox .wb-control.title-bar-controls { display: flex; }',
        '.winbox.min { display: none; }', // WinBox uses its own minimize-bar logic; hide window while minimized
        '.winbox.no-full .wb-full { display: none; }'
    ].join('\n');
    document.head.appendChild(style);

    // ---------------------------------------------------------------
    // 2. Build the hybrid template: WinBox functional classes (wb-*)
    //    layered with 7.css visual classes (title-bar, window-body, ...)
    // ---------------------------------------------------------------
    function buildTemplate() {
        var tpl = document.createElement('div');
        tpl.innerHTML =
            '<div class="wb-header title-bar">' +
                '<div class="wb-drag title-bar-text"><div class="wb-icon"></div><div class="wb-title"></div></div>' +
                '<div class="wb-control title-bar-controls">' +
                    '<button class="wb-min" aria-label="Minimize"></button>' +
                    '<button class="wb-max" aria-label="Maximize"></button>' +
                    '<button class="wb-full" aria-label="Fullscreen" style="display:none"></button>' +
                    '<button class="wb-close" aria-label="Close"></button>' +
                '</div>' +
            '</div>' +
            '<div class="wb-body window-body has-space"></div>' +
            '<div class="wb-n"></div><div class="wb-s"></div><div class="wb-w"></div><div class="wb-e"></div>' +
            '<div class="wb-nw"></div><div class="wb-ne"></div><div class="wb-se"></div><div class="wb-sw"></div>';
        return tpl;
    }

    // ---------------------------------------------------------------
    // 3. Wrap the WinBox constructor so every window automatically
    //    gets the hybrid template + 7.css "window" root classes,
    //    and wires up the Maximize <-> Restore aria-label swap.
    // ---------------------------------------------------------------
    var OriginalWinBox = WinBox;

    function PatchedWinBox(a, b) {
        if (!(this instanceof PatchedWinBox)) return new PatchedWinBox(a);

        var opts = a;
        if (typeof a === 'string') {
            opts = b || {};
            opts.title = a;
        } else {
            opts = a || {};
        }

        // Don't clobber an explicitly supplied template.
        if (!opts.template) {
            opts.template = buildTemplate();
        }

        // Merge in 7.css root classes ("window" + optional "glass" + optional "active").
        var extra = ['window'];
        if (opts.glass) extra.push('glass');
        if (opts.active !== false) extra.push('active');

        var existing = opts['class']
            ? (Array.isArray(opts['class']) ? opts['class'] : [opts['class']])
            : [];
        opts['class'] = existing.concat(extra);

        // Keep WinBox's own header height option in sync with our CSS constant
        // unless the caller explicitly set one.
        if (opts.header === undefined) opts.header = HEADER_HEIGHT;

        // Preserve user callbacks while adding the Restore aria-label swap.
        var userMax = opts.onmaximize, userRestore = opts.onrestore;
        opts.onmaximize = function () {
            var btn = this.g.querySelector('.wb-max');
            if (btn) btn.setAttribute('aria-label', 'Restore');
            if (userMax) userMax.call(this);
        };
        opts.onrestore = function () {
            var btn = this.g.querySelector('.wb-max');
            if (btn) btn.setAttribute('aria-label', 'Maximize');
            if (userRestore) userRestore.call(this);
        };

        return new OriginalWinBox(opts);
    }

    PatchedWinBox.prototype = OriginalWinBox.prototype;
    PatchedWinBox['new'] = function (a) { return new PatchedWinBox(a); };
    PatchedWinBox.stack = OriginalWinBox.stack;

    window.WinBox = PatchedWinBox;
})();