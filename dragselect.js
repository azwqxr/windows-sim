//dragselect
(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

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

    function draw9Slice(x, y, w, h) {
        const border = 4;

        if (w <= 0 || h <= 0) return;

        // Top-left
        ctx.drawImage(
            selectImg,
            0, 0, 1, 1,
            x, y, border, border
        );

        // Top
        ctx.drawImage(
            selectImg,
            1, 0, 1, 1,
            x + border, y,
            Math.max(0, w - border * 2),
            border
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
            border,
            Math.max(0, h - border * 2)
        );

        // Center
        ctx.drawImage(
            selectImg,
            1, 1, 1, 1,
            x + border, y + border,
            Math.max(0, w - border * 2),
            Math.max(0, h - border * 2)
        );

        // Right
        ctx.drawImage(
            selectImg,
            2, 1, 1, 1,
            x + w - border,
            y + border,
            border,
            Math.max(0, h - border * 2)
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
            Math.max(0, w - border * 2),
            border
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

    selectImg.onload = draw;
})();