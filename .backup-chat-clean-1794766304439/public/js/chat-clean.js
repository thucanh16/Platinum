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
 let previousVisible = false;
 const sync = () => {
  const visible = Boolean(consent && !consent.hidden);
  if (visible && !previousVisible && !checkbox?.checked) details.open = true;
  previousVisible = visible;
 };
 if (consent) new MutationObserver(sync).observe(consent, {attributes:true, attributeFilter:['hidden']});
 if (checkbox) checkbox.addEventListener('change', () => { if (checkbox.checked) details.open = false; });
 sync();
}
