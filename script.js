// --- PERFORMANCE OPTIMIZATION UTILS ---
// Throttling for scroll/resize events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Global Init on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initBootOrPageLoad();
    initNebulaBackground();
    initUptimeCounter();
    initScrollReveal(); // New Premium Animation
    initVoxelModel();   // New Voxel Logic
    initNavbarScroll();
    initThemeToggle();
});

// --- THEME & NAVBAR LOGIC ---
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100), { passive: true });
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    
    // Check local storage or system pref
    let savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        savedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    btn.innerHTML = savedTheme === 'dark' ? '🌓' : '🌑';

    btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        btn.innerHTML = newTheme === 'dark' ? '🌓' : '🌑';
    });
}


// --- VOXEL 3D MODEL GENERATOR ---
// --- VOXEL 3D MODEL GENERATOR (Optimized) ---
function initVoxelModel() {
    const container = document.getElementById('voxel-model');
    if(!container) return;
    
    container.innerHTML = '';
    
    const group = document.createElement('div');
    group.className = 'voxel-group';
    
    // Space Invader Map
    const map = [
        "00100000100",
        "00010001000",
        "00111111100",
        "01101110110", 
        "11111111111",
        "10111111101",
        "10100000101",
        "00011011000"
    ];

    const size = 30; 
    const cols = 11;
    const rows = 8;
    
    map.forEach((rowStr, y) => {
        for(let x=0; x<rowStr.length; x++) {
            const char = rowStr[x];
            if(char !== '0') {
                const voxel = document.createElement('div');
                voxel.className = 'voxel';
                
                let color = 'var(--highlight-color)';
                let isEye = false;
                if (y === 3 && (x === 3 || x === 7)) {
                     color = '#fff';
                     isEye = true;
                     voxel.classList.add('glow-eye');
                }
                
                const xPos = (x - cols/2) * size;
                const yPos = (y - rows/2) * size;
                
                voxel.style.backgroundColor = color;
                voxel.style.transform = `translate3d(${xPos}px, ${yPos}px, 0px)`;
                
                // OPTIMIZATION: Only add faces that are strictly necessary for 3D feel
                // Front, Right, Left, Top, Bottom. Back is usually hidden.
                // Or even better: Use a single element for the main block and pseudo-elements for sides?
                // For now, removing Back face as it's rarely seen in this rotation and saves 50+ DOM nodes.
                // Also removing the "Second Layer" distinct voxels entirely.
                // Instead, we will make the voxel "thick" via CSS faces.
                
                ['v-front', 'v-right', 'v-left', 'v-top', 'v-bottom'].forEach(c => {
                    const f = document.createElement('div');
                    f.className = c;
                    f.style.backgroundColor = color; 
                    if(isEye) f.style.boxShadow = '0 0 5px #fff'; // Lighter shadow
                    voxel.appendChild(f);
                });
                group.appendChild(voxel);
            }
        }
    });

    container.appendChild(group);
    
    // Animation Label
    const label = document.createElement('div');
    label.innerHTML = '[ SYSTEM_GUARDIAN ]';
    label.className = 'animate-item';
    label.style.position = 'absolute';
    label.style.bottom = '-60px';
    label.style.width = '100%';
    label.style.textAlign = 'center';
    label.style.color = 'var(--highlight-color)';
    container.appendChild(label);
}

// --- SCROLL REVEAL ANIMATION ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        let staggerDelay = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply a dynamic stagger effect if multiple elements appear at once
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, staggerDelay * 100);
                staggerDelay++;
                // Unobserve after revealing to prevent re-animating
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    // Target almost all structured elements for reveal effect
    const targets = document.querySelectorAll('.reveal-on-scroll, .content-frame, .card, .terminal-header, .animate-item, .table-row, .specs-box, .cert-box, .input-wrap');
    targets.forEach(el => {
        el.classList.add('reveal-on-scroll'); // Add base class here if missing
        observer.observe(el);
    });
}



// --- MAGNETIC CURSOR LOGIC (Robust & Optimized) ---
function initCursor() {
    // Only run on non-touch devices
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cursorWrapper = document.querySelector('.cursor-wrapper');
    const cursorBlob = document.querySelector('.cursor-blob');
    
    // Safety check
    if (!cursorWrapper || !cursorBlob) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isMoving = false;

    // Track mouse position efficiently
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Direct update for wrapper (no lag needed here)
        cursorWrapper.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        isMoving = true;
    }, { passive: true });

    // Smooth animation loop using requestAnimationFrame
    function animateCursor() {
        if (isMoving) {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            // Optimization: Stop updating if close enough
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                cursorX += dx * 0.15; // Smooth factor
                cursorY += dy * 0.15;
                cursorBlob.style.transform = `translate3d(${cursorX - mouseX}px, ${cursorY - mouseY}px, 0) translate(-50%, -50%)`;
            } else {
                 isMoving = false; // Pause loop if static
            }
        } else {
             // Occasionally check if drifted (rare case fixes)
             if(Math.abs(mouseX - cursorX) > 1) isMoving = true;
        }
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Interaction states
    const interactables = document.querySelectorAll('a, button, input, textarea, .card, .table-row');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => cursorBlob.classList.add('active'), { passive: true });
        el.addEventListener('mouseleave', () => cursorBlob.classList.remove('active'), { passive: true });
    });
}


// --- BOOT & PAGE LOAD LOGIC ---
function initBootOrPageLoad() {
    const bootScreen = document.getElementById('boot-screen');
    
    // Page Transition Fade In
    setTimeout(() => document.body.classList.add('loaded'), 100);

    if (bootScreen) {
        // Run Boot Sequence
        runBootSequence(bootScreen);
    } else {
        // Standard Page Animations
        startPageAnimations();
    }
}

function runBootSequence(screen) {
    const bootLog = document.getElementById('boot-log');
    const bootProgress = document.querySelector('.boot-progress');
    if(!bootLog || !bootProgress) return;

    const bootMessages = [
        "BIOS...OK",
        "Kernel...Loaded",
        "GPU...Init",
        "Net...Connected",
        "User...Auth",
        "System...Ready"
    ];

    let delay = 0;
    const totalTime = 2500; // Increased to 2.5 seconds for a satisfying pre-load
    const interval = totalTime / bootMessages.length;

    bootMessages.forEach((msg, index) => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.textContent = `> ${msg}`;
            bootLog.appendChild(p);
            bootLog.scrollTop = bootLog.scrollHeight;
            
            const percent = ((index + 1) / bootMessages.length) * 100;
            bootProgress.style.width = `${percent}%`;
            
        }, delay);
        delay += interval; 
    });

    setTimeout(() => {
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.remove();
            startPageAnimations();
            init3DGlobe(); 
        }, 500);
    }, totalTime + 100);
}


// --- 3D WIREFRAME GLOBE (Highly Optimized) ---
function init3DGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if(!canvas) return; // Exit if not on home page
    
    // If the canvas exists but we are using Voxel model now, we might want to disable this if it's hidden?
    // Actually, checking index.html, the globe-canvas was REPLACED by voxel-container. 
    // So this function runs but finds no canvas, which is fine.
    // However, initNebulaBackground IS still running. Let's check that.

    canvas.width = width;
    canvas.height = height;

    // Reduced particle count for performance
    const numParticles = 30; 
    const radius = width * 0.35;
    const particles = [];
    
    for(let i=0; i<numParticles; i++) {
        const theta = Math.acos( -1 + ( 2 * i ) / numParticles );
        const phi = Math.sqrt( numParticles * Math.PI ) * theta;
        particles.push({
            x: radius * Math.sin(theta) * Math.cos(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(theta)
        });
    }

    let angleX = 0.002;
    let angleY = 0.003;

    function draw() {
        if(!document.contains(canvas)) return; // Stop if canvas removed

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillStyle = '#fff';
        
        // Batch path operations
        ctx.beginPath();
        for(let i=0; i<particles.length; i++) {
            const p = particles[i];
            
            // Rotate
            const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
            const x = p.x * cosY - p.z * sinY;
            const z = p.z * cosY + p.x * sinY;
            const y = p.y; // Temp store
            
            const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
            const yNew = y * cosX - z * sinX;
            const zNew = z * cosX + y * sinX;
            
            p.x = x; p.y = yNew; p.z = zNew;

            const scale = 300 / (300 + p.z); 
            const px = width/2 + p.x * scale;
            const py = height/2 + p.y * scale;

            // Draw Point
            ctx.moveTo(px, py);
            ctx.arc(px, py, 1, 0, Math.PI*2);

            // Draw Lines (simplified neighbor check)
            for(let j=i+1; j<particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dz = p.z - p2.z;
                
                // Quick distance block rejection logic
                if (Math.abs(dx) > radius*0.6) continue;

                if ((dx*dx + dy*dy + dz*dz) < (radius*radius * 0.3)) {
                    const scale2 = 300 / (300 + p2.z);
                    const p2x = width/2 + p2.x * scale2;
                    const p2y = height/2 + p2.y * scale2;
                    ctx.moveTo(px, py);
                    ctx.lineTo(p2x, p2y);
                }
            }
        }
        ctx.fill(); // Render points
        ctx.stroke(); // Render lines

        requestAnimationFrame(draw);
    }
    draw();
}


// --- DYNAMIC BACKGROUND (Network/Matrix Hybrid) ---
function initNebulaBackground() {
    const canvas = document.getElementById('bg-canvas');
    if(!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', throttle(resize, 200));
    resize();

    class Node {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Increased size for visibility
            this.size = Math.random() * 2 + 1; 
            // Faster movement
            this.speedX = (Math.random() - 0.5) * 0.8; 
            this.speedY = (Math.random() - 0.5) * 0.8; 
            this.opacity = Math.random() * 0.5 + 0.2; // Higher base opacity
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if(this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
        }
        draw() {
            ctx.fillStyle = `rgba(0, 255, 100, ${this.opacity})`; // Slight green tint for tech feel
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
    }

    const nodeCount = window.innerWidth < 800 ? 30 : 60;
    const nodes = Array.from({ length: nodeCount }, () => new Node());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw Connections
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.05)';
        ctx.lineWidth = 1;
        
        for(let i=0; i<nodes.length; i++) {
            const p1 = nodes[i];
            p1.update();
            p1.draw();

            for(let j=i+1; j<nodes.length; j++) {
                const p2 = nodes[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}


// --- TYPING & SCRAMBLE UTILS ---
function startPageAnimations() {
    // Command Line Typing
    const cmdLine = document.querySelector('.command-line .command-text');
    if (cmdLine) {
        const section = cmdLine.closest('section');
        const cmd = section ? section.getAttribute('data-command') : "sys.init()";
        typeText(cmdLine, cmd);
    }
    
    // Scramble Text Headers
    const scrambles = document.querySelectorAll('.scramble-text');
    scrambles.forEach(el => new TextScramble(el).setText(el.textContent));
    
    // Fade in items
    const items = document.querySelectorAll('.animate-item');
    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('visible');
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 300 + (i * 100));
    });
}

function typeText(element, text, speed = 25) {
    if(!element) return;
    element.innerHTML = '<span class="cursor-blink">_</span>';
    let i = 0;
    function type() {
        if (i < text.length) {
            let content = element.innerText.replace('_', '');
            element.innerText = content + text.charAt(i) + '_';
            i++;
            setTimeout(type, speed);
        } else {
             // Remove cursor after delay
             setTimeout(() => element.innerText = element.innerText.replace('_', ''), 500);
        }
    }
    type();
}

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 10); // Faster scramble
            const end = start + Math.floor(Math.random() * 10);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// Stats / Uptime
function initUptimeCounter() {
    const counter = document.getElementById('uptime-counter');
    if(!counter) return;
    let sec = 0;
    setInterval(() => {
        sec++;
        const h = Math.floor(sec/3600).toString().padStart(2,'0');
        const m = Math.floor((sec%3600)/60).toString().padStart(2,'0');
        const s = (sec%60).toString().padStart(2,'0');
        counter.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// Form logic (Connected to Formsubmit API)
window.sendMessage = async function() {
    const form = document.getElementById('contact-form');
    const btn = document.querySelector('.send-btn');
    if(!btn || !form) return;
    
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if(!email || !message) return;

    const originalText = btn.innerText;
    btn.innerText = '[ TRANSMITTING... ]';
    btn.style.pointerEvents = 'none';

    try {
        const response = await fetch("https://formsubmit.co/ajax/nithish1436m@gmail.com", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                message: message,
                _subject: "New Transmission from NM. Portfolio!"
            })
        });

        if (response.ok) {
            btn.innerText = '[ TRANSMISSION SUCCESS ]';
            btn.style.color = 'var(--highlight-color)';
            form.reset();
        } else {
            throw new Error("Transmission failed");
        }
    } catch (error) {
        btn.innerText = '[ FAILED. RETRY? ]';
        btn.style.color = '#ff3333';
        console.error('Error:', error);
    } finally {
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.pointerEvents = 'all';
            btn.style.color = '';
        }, 3000);
    }
};
