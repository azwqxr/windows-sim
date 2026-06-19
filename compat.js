/**
 * winbox-7css-compat.js
 *
 * WinBox + 7.css integration.
 *
 * Load:
 *   1. 7.css
 *   2. winbox.bundle.js
 *   3. this file
 */

(function () {
    "use strict";

    if (typeof WinBox === "undefined") {
        console.error("WinBox must be loaded first.");
        return;
    }

    const OriginalWinBox = WinBox;

    const style = document.createElement("style");
    style.textContent = `
/* -------------------------------------------------- */
/* WinBox container                                   */
/* -------------------------------------------------- */

.winbox {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    overflow: visible !important;
}

/* remove WinBox skin */

.winbox > .wb-header,
.winbox > .wb-body {
    display: none !important;
}

/* -------------------------------------------------- */
/* 7.css shell                                        */
/* -------------------------------------------------- */

.winbox .wb7-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.winbox .wb7-window .window-body {
    flex: 1;
    overflow: auto;
}

/* -------------------------------------------------- */
/* title text                                         */
/* -------------------------------------------------- */

.winbox .wb-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* -------------------------------------------------- */
/* icon                                                */
/* -------------------------------------------------- */

.winbox .wb-icon {
    width: 16px;
    height: 16px;
    display: none;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 4px;
    vertical-align: middle;
}

.winbox .wb-icon.show {
    display: inline-block;
}

/* -------------------------------------------------- */
/* resize handles                                     */
/* -------------------------------------------------- */

.winbox .wb-n,
.winbox .wb-s,
.winbox .wb-w,
.winbox .wb-e,
.winbox .wb-nw,
.winbox .wb-ne,
.winbox .wb-sw,
.winbox .wb-se {
    position: absolute;
    z-index: 10000;
}

.winbox .wb-n {
    top: 0;
    left: 8px;
    right: 8px;
    height: 5px;
    cursor: n-resize;
}

.winbox .wb-s {
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 5px;
    cursor: s-resize;
}

.winbox .wb-w {
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 5px;
    cursor: w-resize;
}

.winbox .wb-e {
    right: 0;
    top: 8px;
    bottom: 8px;
    width: 5px;
    cursor: e-resize;
}

.winbox .wb-nw {
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;
    cursor: nw-resize;
}

.winbox .wb-ne {
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    cursor: ne-resize;
}

.winbox .wb-sw {
    bottom: 0;
    left: 0;
    width: 8px;
    height: 8px;
    cursor: sw-resize;
}

.winbox .wb-se {
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    cursor: se-resize;
}

/* -------------------------------------------------- */
/* inactive window                                    */
/* -------------------------------------------------- */

.winbox:not(.focus) .wb7-window.active {
    opacity: .96;
}
`;
    document.head.appendChild(style);

    function buildTemplate() {
        const root = document.createElement("div");

        root.innerHTML = `
<div class="window active wb7-window">

    <div class="title-bar">

        <div class="title-bar-text wb-drag">
            <span class="wb-icon"></span>
            <span class="wb-title"></span>
        </div>

        <div class="title-bar-controls">
            <button class="wb-min" aria-label="Minimize"></button>
            <button class="wb-max" aria-label="Maximize"></button>
            <button class="wb-close" aria-label="Close"></button>
        </div>

    </div>

    <div class="window-body has-space wb-body"></div>

</div>

<div class="wb-n"></div>
<div class="wb-s"></div>
<div class="wb-w"></div>
<div class="wb-e"></div>

<div class="wb-nw"></div>
<div class="wb-ne"></div>
<div class="wb-sw"></div>
<div class="wb-se"></div>
`;

        return root;
    }

    function PatchedWinBox(a, b) {

        let opts;

        if (typeof a === "string") {
            opts = b || {};
            opts.title = a;
        } else {
            opts = a || {};
        }

        opts = Object.assign({}, opts);

        if (!opts.template) {
            opts.template = buildTemplate();
        }

        const userFocus = opts.onfocus;
        const userBlur = opts.onblur;
        const userRestore = opts.onrestore;
        const userMax = opts.onmaximize;

        opts.onfocus = function () {

            const w = this.g.querySelector(".wb7-window");

            if (w) {
                w.classList.add("active");
            }

            if (userFocus) {
                userFocus.call(this);
            }
        };

        opts.onblur = function () {

            const w = this.g.querySelector(".wb7-window");

            if (w) {
                w.classList.remove("active");
            }

            if (userBlur) {
                userBlur.call(this);
            }
        };

        opts.onmaximize = function () {

            const btn = this.g.querySelector(".wb-max");

            if (btn) {
                btn.setAttribute("aria-label", "Restore");
            }

            if (userMax) {
                userMax.call(this);
            }
        };

        opts.onrestore = function () {

            const btn = this.g.querySelector(".wb-max");

            if (btn) {
                btn.setAttribute("aria-label", "Maximize");
            }

            if (userRestore) {
                userRestore.call(this);
            }
        };

        const win = new OriginalWinBox(opts);

        if (opts.icon) {

            const icon = win.g.querySelector(".wb-icon");

            if (icon) {
                icon.style.backgroundImage = `url("${opts.icon}")`;
                icon.classList.add("show");
            }
        }

        return win;
    }

    PatchedWinBox.prototype = OriginalWinBox.prototype;
    PatchedWinBox.stack = OriginalWinBox.stack;
    PatchedWinBox.new = function (o) { return new PatchedWinBox(o); };

    window.WinBox = PatchedWinBox;

})();