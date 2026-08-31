const maximumBackupSize = 10 * 1024 * 1024;

export async function shareBackupFile(contents: string, filename: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,text/json,text/plain,.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    let settled = false;
    let focusTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (value: string | null, error?: unknown) => {
      if (settled) return;
      settled = true;
      if (focusTimer) clearTimeout(focusTimer);
      window.removeEventListener('focus', handleFocus);
      input.remove();
      if (error) reject(error); else resolve(value);
    };
    const handleFocus = () => {
      focusTimer = setTimeout(() => { if (!input.files?.length) finish(null); }, 300);
    };
    input.addEventListener('cancel', () => finish(null), { once: true });
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) { finish(null); return; }
      if (file.size > maximumBackupSize) { finish(null, new Error('This backup is too large. Choose a Repbook backup smaller than 10 MB.')); return; }
      file.text().then((contents) => finish(contents), (error) => finish(null, error));
    }, { once: true });
    window.addEventListener('focus', handleFocus, { once: true });
    input.click();
  });
}
