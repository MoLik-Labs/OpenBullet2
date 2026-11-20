'use strict';
(() => {
    const get = id => document.getElementById(id);
    const limit = 256 * 1024;
    let compiled;
    const files = [get('baseline-file'), get('candidate-file')];
    const status = get('compare-status');
    const button = get('compare-run');
    function reset() {
        get('differences').replaceChildren();
        button.disabled = files.some(input => !input.files.length);
        status.textContent = button.disabled ? 'Choose both manifests to compare.' : 'Ready to compare.';
    }
    files.forEach(input => input.addEventListener('change', reset));
    button.addEventListener('click', async () => {
        if (button.disabled) return;
        files.forEach(input => { input.disabled = true; });
        button.disabled = true;
        get('differences').replaceChildren();
        try {
            const selected = files.map(input => input.files[0]);
            if (selected.some(file => file.size > limit)) throw Error('Each manifest must be at most 256 KiB.');
            status.textContent = 'Comparing…';
            compiled ??= WebAssembly.compile(Uint8Array.from(atob(manifestBytes), c => c.charCodeAt(0)));
            const {exports: engine} = await WebAssembly.instantiate(await compiled);
            const [a,b] = await Promise.all(selected.map(file => file.arrayBuffer()));
            const start = engine.input();
            new Uint8Array(engine.memory.buffer,start,a.byteLength).set(new Uint8Array(a));
            new Uint8Array(engine.memory.buffer,start+limit,b.byteLength).set(new Uint8Array(b));
            const size = engine.run(a.byteLength,b.byteLength);
            const text = new TextDecoder().decode(new Uint8Array(engine.memory.buffer,engine.output(),size));
            if (text.startsWith('Error:')) { status.textContent = text; return; }
            const [summary,...rows] = text.split('\n');
            const [added,removed,common] = summary.split('\t');
            status.textContent = `${added} added · ${removed} removed · ${common} unchanged names`;
            get('differences').replaceChildren(...rows.map(line => {
                const [sign,name] = line.split('\t');
                const row = document.createElement('li');
                const label = document.createElement('code');
                label.textContent = name;
                const kind = document.createElement('span');
                kind.textContent = sign === '+' ? 'Added' : 'Removed';
                row.append(label,kind); return row;
            }));
            record('Manifest comparison', `${added} added, ${removed} removed`);
        } catch (error) {
            status.textContent = error.message === 'Each manifest must be at most 256 KiB.' ? error.message : 'Comparison failed. Check browser WebAssembly support and file access.';
        } finally {
            files.forEach(input => { input.disabled = false; });
            button.disabled = files.some(input => !input.files.length);
        }
    });
})();
