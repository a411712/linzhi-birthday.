!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网页</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
        }

        body {
            background-color: #87CEEB;
            position: relative;
        }

        .greeting-text {
            position: absolute;
            top: 140px;
            left: 50%;
            transform: translateX(-50%);
            color: #6482B4;
            font-family: "STXingkai", "华文行楷", "XingKai SC", "KaiTi", "STKaiti", cursive;
            font-size: 60px;
            white-space: nowrap;
            z-index: 2;
        }

        .pass-input {
            position: absolute;
            top: 300px;
            left: 50%;
            transform: translateX(-50%);
            width: 320px;
            background-color: #f0f0f0;
            font-size: 20px;
            padding: 10px 20px;
            border-radius: 12px;
            border: 2px solid rgba(70, 130, 180, 0.35);
            text-align: center;
            outline: none;
            z-index: 2;
        }

        .pass-input:focus {
            border-color: #4682B4;
        }

        .enter-btn {
            position: absolute;
            top: 368px;
            left: 50%;
            transform: translateX(-50%);
            width: 320px;
            background-color: #b0c4de;
            color: #1f3a52;
            font-size: 18px;
            padding: 6px 20px;
            border: none;
            border-radius: 999px;
            cursor: pointer;
            z-index: 2;
        }

        .enter-btn:hover {
            background-color: #9db4d1;
        }

        .modal-mask {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.25);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }

        .modal-mask.show {
            display: flex;
        }

        .modal-box {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 28px 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            animation: pop 0.25s ease;
        }

        @keyframes pop {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .modal-answer {
            font-size: 24px;
            color: #4682B4;
            margin-bottom: 12px;
        }

        .modal-tip {
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
        }

        .modal-ok {
            background-color: #b0c4de;
            color: #1f3a52;
            font-size: 16px;
            padding: 8px 36px;
            border: none;
            border-radius: 999px;
            cursor: pointer;
        }

        .modal-ok:hover {
            background-color: #9db4d1;
        }

        #ribbon-canvas {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
    </style>
</head>
<body>
    <canvas id="ribbon-canvas"></canvas>
    <div class="greeting-text">林致  生日快乐</div>
    <input type="text" id="pass-input" class="pass-input" placeholder="输入通关密语，按回车进入" maxlength="20">
    <button type="button" id="enter-btn" class="enter-btn">进 入</button>

    <div class="modal-mask" id="modal-mask">
        <div class="modal-box">
            <div class="modal-answer">林致生日快乐</div>
            <div class="modal-tip">请重新输入</div>
            <button type="button" id="modal-ok" class="modal-ok">知道了</button>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('ribbon-canvas');
        const ctx = canvas.getContext('2d');
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FB5', '#FF9F45', '#B983FF', '#FFFFFF'];
        const butterflyColors = ['#1E6091', '#2A7FB8', '#3A86C8', '#4682B4', '#5B9BD5', '#1B4F72'];
        let ribbons = [];
        let butterflies = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const count = Math.min(140, Math.floor(canvas.width * canvas.height / 12000));
            ribbons = Array.from({ length: count }, createRibbon);
            butterflies = Array.from({ length: 9 }, createButterfly);
        }

        function createRibbon(fromTop) {
            return {
                x: Math.random() * canvas.width,
                y: fromTop ? -20 : Math.random() * canvas.height,
                w: 6 + Math.random() * 6,
                h: 12 + Math.random() * 14,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: 1 + Math.random() * 2,
                swing: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 0.15
            };
        }

        function createButterfly() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 10 + Math.random() * 8,
                color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
                angle: Math.random() * Math.PI * 2,
                speed: 0.6 + Math.random() * 0.8,
                turn: (Math.random() - 0.5) * 0.04,
                flap: Math.random() * Math.PI * 2,
                flapSpeed: 0.18 + Math.random() * 0.12,
                wander: Math.random() * Math.PI * 2
            };
        }

        function drawButterfly(b) {
            b.flap += b.flapSpeed;
            b.wander += 0.02;
            b.angle += b.turn + Math.sin(b.wander) * 0.03;
            b.x += Math.cos(b.angle) * b.speed;
            b.y += Math.sin(b.angle) * b.speed;

            // 飘出屏幕后从另一侧回来
            if (b.x < -40) b.x = canvas.width + 40;
            if (b.x > canvas.width + 40) b.x = -40;
            if (b.y < -40) b.y = canvas.height + 40;
            if (b.y > canvas.height + 40) b.y = -40;

            const flapScale = 0.35 + Math.abs(Math.sin(b.flap)) * 0.65;
            const s = b.size;

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle + Math.PI / 2);

            // 左侧翅膀（上翅 + 下翅）
            ctx.save();
            ctx.scale(flapScale, 1);
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.ellipse(-s * 0.55, -s * 0.55, s * 0.6, s * 0.85, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-s * 0.45, s * 0.5, s * 0.45, s * 0.6, 0.4, 0, Math.PI * 2);
            ctx.fill();
            // 右侧翅膀
            ctx.beginPath();
            ctx.ellipse(s * 0.55, -s * 0.55, s * 0.6, s * 0.85, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(s * 0.45, s * 0.5, s * 0.45, s * 0.6, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 翅膀上的浅色点缀
            ctx.save();
            ctx.scale(flapScale, 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.beginPath();
            ctx.arc(-s * 0.7, -s * 0.85, s * 0.13, 0, Math.PI * 2);
            ctx.arc(s * 0.7, -s * 0.85, s * 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 身体与触角
            ctx.strokeStyle = '#10334f';
            ctx.lineWidth = Math.max(1.5, s * 0.14);
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.7);
            ctx.lineTo(0, s * 0.8);
            ctx.stroke();
            ctx.lineWidth = Math.max(1, s * 0.06);
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.7);
            ctx.quadraticCurveTo(-s * 0.3, -s * 1.1, -s * 0.45, -s * 1.2);
            ctx.moveTo(0, -s * 0.7);
            ctx.quadraticCurveTo(s * 0.3, -s * 1.1, s * 0.45, -s * 1.2);
            ctx.stroke();

            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ribbons.forEach((r, i) => {
                r.phase += 0.02;
                r.y += r.vy;
                r.x += Math.sin(r.phase) * r.swing * 0.5;
                r.rot += r.vrot;

                if (r.y > canvas.height + 20) {
                    ribbons[i] = createRibbon(true);
                    ribbons[i].x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(r.x, r.y);
                ctx.rotate(r.rot);
                ctx.fillStyle = r.color;
                ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
                ctx.restore();
            });
            butterflies.forEach(drawButterfly);
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        draw();

        const passInput = document.getElementById('pass-input');
        const enterBtn = document.getElementById('enter-btn');
        const modalMask = document.getElementById('modal-mask');
        const modalOk = document.getElementById('modal-ok');
        const SECRET = '林致，生日快乐';

        function showError() {
            modalMask.classList.add('show');
        }

        function closeError() {
            modalMask.classList.remove('show');
            passInput.value = '';
            passInput.focus();
        }

        function tryEnter() {
            if (passInput.value.trim() === SECRET) {
                // 趁用户点击的手势，直接在顶层窗口启动背景乐（自动播放策略下最可靠）
                if (!window.__bgmStarted) {
                    try {
                        const bgm = new Audio('../music/提取音乐_20261007214130.mp3');
                        bgm.loop = true;
                        bgm.volume = 0.18;
                        bgm.play().catch(() => {});
                        window.__bgmStarted = bgm;
                    } catch (e) {}
                }
                // 以 iframe 覆盖方式打开 page2，页面不卸载、背景乐不断
                const iframe = document.createElement('iframe');
                iframe.src = 'page2.html?bgm=1';
                iframe.allow = 'autoplay';
                iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:none;z-index:200;';
                document.body.appendChild(iframe);
            } else {
                showError();
            }
        }

        enterBtn.addEventListener('click', tryEnter);
        modalOk.addEventListener('click', closeError);
        modalMask.addEventListener('click', (e) => {
            if (e.target === modalMask) {
                closeError();
            }
        });
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                tryEnter();
            }
        });
    </script>
</body>
</html>
