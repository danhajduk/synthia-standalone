export async function updateEmailLabel(id, newLabel) {
    const res = await fetch('/api/gmail/manual-review/update-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, new_label: newLabel })
    });
  
    if (!res.ok) {
      throw new Error(`Failed to update label: ${res.status}`);
    }
  
    return await res.json();
  }
  