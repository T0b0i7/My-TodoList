(function(){
    const musicBtn = document.getElementById('music-btn');
    const musicPanel = document.getElementById('music-panel');
    const closeMusic = document.getElementById('close-music');
    const addTrack = document.getElementById('add-track');
    const trackUrl = document.getElementById('track-url');
    const trackFile = document.getElementById('track-file');
    const bgEnable = document.getElementById('bg-enable');
    const bgToggle = document.getElementById('bg-toggle');
    const savePlaylist = document.getElementById('save-playlist');
    const loadPlaylist = document.getElementById('load-playlist');
    const clearPlaylist = document.getElementById('clear-playlist');
    const playlistEl = document.getElementById('playlist');
    const audio = document.getElementById('audio-player');

    let playlist = []; // array of {url, label}

    if(!musicBtn || !musicPanel) return;

    musicBtn.addEventListener('click', () => {
        const open = musicPanel.getAttribute('aria-hidden') === 'false';
        musicPanel.setAttribute('aria-hidden', open ? 'true' : 'false');
        musicBtn.setAttribute('aria-pressed', open ? 'false' : 'true');
    });

    if(closeMusic) closeMusic.addEventListener('click', () => {
        musicPanel.setAttribute('aria-hidden', 'true');
        musicBtn.setAttribute('aria-pressed', 'false');
    });

    function renderPlaylist(){
        playlistEl.innerHTML = '';
        playlist.forEach((item, idx) => {
            const li = document.createElement('li');
            const label = document.createElement('span');
            label.textContent = item.label || item.url;
            const playBtn = document.createElement('button');
            playBtn.textContent = '▶';
            playBtn.classList.add('play');
            playBtn.addEventListener('click', () => {
                audio.src = item.url;
                audio.play();
            });
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✖';
            removeBtn.classList.add('remove');
            removeBtn.addEventListener('click', () => {
                playlist.splice(idx,1);
                renderPlaylist();
            });
            li.appendChild(label);
            const right = document.createElement('div');
            right.appendChild(playBtn);
            right.appendChild(removeBtn);
            li.appendChild(right);
            playlistEl.appendChild(li);
        });
    }

    // URL-based adding removed per UI request. Local files still supported below.

    function extractName(url){
        try{
            const u = new URL(url);
            const p = u.pathname.split('/');
            const last = p[p.length-1];
            return decodeURIComponent(last) || url;
        } catch(e){
            // fallback: try simple parsing
            const parts = url.split('/');
            return parts[parts.length-1] || url;
        }
    }

    // local file support (session only via objectURL)
    if(trackFile){
        trackFile.addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if(!f) return;
            const url = URL.createObjectURL(f);
            playlist.push({ url, label: f.name });
            renderPlaylist();
            // We do not persist objectURLs in localStorage (not meaningful across reloads)
            // If user wants background music and the bg checkbox is enabled, use this file as background loop
            try {
                if(bgEnable && bgEnable.checked) {
                    audio.src = url;
                    audio.loop = true;
                    audio.play().catch(()=>{});
                    sessionStorage.setItem('bgObjectUrl', url);
                }
            } catch(e) { /* ignore play errors (autoplay restrictions) */ }
        });
    }

    // Background music checkbox / toggle behavior
    if(bgEnable) {
        // restore session-only bg object URL if present
        const saved = sessionStorage.getItem('bgObjectUrl');
        if(saved) {
            bgEnable.checked = true;
            audio.src = saved;
            audio.loop = true;
        }
        bgEnable.addEventListener('change', () => {
            if(bgEnable.checked) {
                // if no audio yet, try to pick first item in playlist
                if(!audio.src && playlist.length>0) audio.src = playlist[0].url;
                audio.loop = true;
                audio.play().catch(()=>{});
            } else {
                audio.pause();
                audio.loop = false;
                sessionStorage.removeItem('bgObjectUrl');
            }
        });
    }

    if(bgToggle) {
        bgToggle.addEventListener('click', () => {
            if(audio.paused) audio.play().catch(()=>{});
            else audio.pause();
        });
    }

    // persistence: save/load/clear playlist URLs in localStorage
    if(savePlaylist){
        savePlaylist.addEventListener('click', () => {
            const toSave = playlist.map(p => ({url: p.url, label: p.label}));
            localStorage.setItem('savedPlaylist', JSON.stringify(toSave));
            alert('Playlist enregistrée localement.');
        });
    }

    if(loadPlaylist){
        loadPlaylist.addEventListener('click', () => {
            const raw = localStorage.getItem('savedPlaylist');
            if(!raw) return alert('Aucune playlist sauvegardée.');
            try{
                const parsed = JSON.parse(raw);
                if(Array.isArray(parsed)){
                    playlist = parsed;
                    renderPlaylist();
                    alert('Playlist chargée.');
                }
            } catch(e){ alert('Impossible de charger la playlist sauvegardée.'); }
        });
    }

    if(clearPlaylist){
        clearPlaylist.addEventListener('click', () => {
            localStorage.removeItem('savedPlaylist');
            alert('Sauvegarde effacée.');
        });
    }

    // load saved playlist on start
    (function(){
        const raw = localStorage.getItem('savedPlaylist');
        if(!raw) return;
        try{
            const parsed = JSON.parse(raw);
            if(Array.isArray(parsed)){
                playlist = parsed;
                renderPlaylist();
            }
        } catch(e) { /* ignore */ }
    })();
})();
