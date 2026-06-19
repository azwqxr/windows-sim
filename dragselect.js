// dragselect
(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    canvas.id = "selectionCanvas";

    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "-2147483648"
    });

    function attachCanvas() {
        if (!document.body) {
            requestAnimationFrame(attachCanvas);
            return;
        }

        document.body.insertBefore(
            canvas,
            document.body.firstChild
        );
    }

    attachCanvas();

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const selectImg = new Image();
    selectImg.src = "select.png";

    let centerPattern = null;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;

        dragging = true;
        startX = currentX = e.clientX;
        startY = currentY = e.clientY;
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        currentX = e.clientX;
        currentY = e.clientY;

        draw();
    });

    document.addEventListener("mouseup", () => {
        if (!dragging) return;

        dragging = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    window.addEventListener("blur", () => {
        dragging = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    function getBorderSize() {
        const scale = Math.min(
            window.innerWidth,
            window.innerHeight
        );

        return Math.max(
            4,
            Math.round(scale / 180)
        );
    }

    function draw9Slice(x, y, w, h) {
        if (w <= 0 || h <= 0) return;

        const border = Math.min(
            getBorderSize(),
            Math.floor(w / 2),
            Math.floor(h / 2)
        );

        const centerW = Math.max(0, w - border * 2);
        const centerH = Math.max(0, h - border * 2);

        // Top-left
        ctx.drawImage(
            selectImg,
            0, 0, 1, 1,
            x, y,
            border, border
        );

        // Top
        ctx.drawImage(
            selectImg,
            1, 0, 1, 1,
            x + border, y,
            centerW, border
        );

        // Top-right
        ctx.drawImage(
            selectImg,
            2, 0, 1, 1,
            x + w - border, y,
            border, border
        );

        // Left
        ctx.drawImage(
            selectImg,
            0, 1, 1, 1,
            x, y + border,
            border, centerH
        );

        // Center (tiled)
        if (centerPattern && centerW > 0 && centerH > 0) {
            ctx.fillStyle = centerPattern;
            ctx.fillRect(
                x + border,
                y + border,
                centerW,
                centerH
            );
        }

        // Right
        ctx.drawImage(
            selectImg,
            2, 1, 1, 1,
            x + w - border,
            y + border,
            border, centerH
        );

        // Bottom-left
        ctx.drawImage(
            selectImg,
            0, 2, 1, 1,
            x, y + h - border,
            border, border
        );

        // Bottom
        ctx.drawImage(
            selectImg,
            1, 2, 1, 1,
            x + border,
            y + h - border,
            centerW, border
        );

        // Bottom-right
        ctx.drawImage(
            selectImg,
            2, 2, 1, 1,
            x + w - border,
            y + h - border,
            border, border
        );
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const w = Math.abs(currentX - startX);
        const h = Math.abs(currentY - startY);

        if (w < 2 || h < 2) return;

        draw9Slice(x, y, w, h);
    }

    selectImg.onload = () => {
        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = 1;
        tileCanvas.height = 1;

        const tileCtx = tileCanvas.getContext("2d");
        tileCtx.imageSmoothingEnabled = false;

        tileCtx.drawImage(
            selectImg,
            1, 1, 1, 1,
            0, 0, 1, 1
        );

        centerPattern = ctx.createPattern(
            tileCanvas,
            "repeat"
        );

        draw();
    };
})();