// Festive snow script
(function(){
    const canvas = document.getElementById('snow-canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if(!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let flakes = [];
    let running = true;
    // density base, will be scaled down on small screens
    function computeFlakeCount() {
        const area = width * height;
        // base density factor
        let factor = 70000;
        if (width <= 600) factor = 140000; // fewer flakes on small screens
        if (window.devicePixelRatio && window.devicePixelRatio > 1) {
            // increase factor to reduce flakes on high-DPI to avoid overload
            factor *= window.devicePixelRatio;
        }
        return Math.max(10, Math.floor(area / factor));
    }
    let flakeCount = computeFlakeCount();

    function rand(min, max){ return Math.random() * (max - min) + min; }

    function createFlake(){
        return {
            x: rand(0, width),
            y: rand(-height, 0),
            r: rand(1, 4),
            d: rand(0.5, 2.0),
            sway: rand(0, Math.PI * 2),
            swaySpeed: rand(0.002, 0.01)
        };
    }

    function init(){
        flakes = [];
        flakeCount = computeFlakeCount();
        for(let i=0;i<flakeCount;i++) flakes.push(createFlake());
    }

    function resize(){
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
    }

    function draw(){
        if(!running) return;
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for(let i=0;i<flakes.length;i++){
            const f = flakes[i];
            f.sway += f.swaySpeed;
            f.x += Math.sin(f.sway) * 0.6 * f.d;
            f.y += 0.6 * f.d + f.r * 0.05;
            if(f.y > height + 10){
                flakes[i] = createFlake();
                flakes[i].y = -10;
            }
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);

    // support floating snow button (new) or legacy toggle
    const toggle = document.getElementById('floating-snow') || document.getElementById('toggle-snow');
    if(toggle){
        // initialize
        toggle.setAttribute('aria-pressed', running ? 'true' : 'false');
        // click toggles running
        toggle.addEventListener('click', function(){
            running = !running;
            toggle.setAttribute('aria-pressed', running ? 'true' : 'false');
            if(toggle.tagName === 'BUTTON' && toggle.textContent.length <= 2){
                // keep icon for floating, else update text
                toggle.textContent = running ? '❄' : '❄';
            }
            if(running) draw();
            else ctx.clearRect(0,0,width,height);
        });
    }

    // Start
    init();
    draw();
})();
