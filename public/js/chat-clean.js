const panel = document.getElementById('chat-panel');
if (panel && !document.getElementById('chat-privacy-details')) {
 const consent = document.getElementById('chat-cloud-consent');
 const info = document.getElementById('chat-info');
 const mode = document.getElementById('chat-mode');
 const form = document.getElementById('chat-form');
 const details = document.createElement('details');
 details.id = 'chat-privacy-details';
 const summary = document.createElement('summary');
 summary.textContent = 'Quyền riêng tư & trạng thái';
 details.append(summary);
 if (consent) {
  const text = consent.querySelector('span');
  if (text) text.textContent = 'Đồng ý gửi câu hỏi, lịch sử chat và hồ sơ công khai Platinum tới Google Gemini.';
  details.append(consent);
 }
 if (mode) details.append(mode);
 if (info) details.append(info);
 panel.insertBefore(details, form);
 const checkbox = document.getElementById('allow-external-ai');
 const storageKey = 'platinum-google-consent-v1';
 let accepted = false;
 try { accepted = localStorage.getItem(storageKey) === 'accepted'; } catch {}
 const remember = () => {
  accepted = Boolean(checkbox?.checked);
  try {
   if (accepted) localStorage.setItem(storageKey, 'accepted');
   else localStorage.removeItem(storageKey);
  } catch {}
  sync();
 };
 const sync = () => {
  const external = Boolean(consent && !consent.hidden);
  details.hidden = !external || accepted;
  if (!details.hidden) details.open = true;
 };
 if (checkbox && accepted) {
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event('change', {bubbles:true}));
 }
 if (consent) new MutationObserver(sync).observe(consent, {attributes:true, attributeFilter:['hidden']});
 if (checkbox) checkbox.addEventListener('change', remember);
 sync();
}
