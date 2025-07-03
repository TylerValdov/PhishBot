document.getElementById("scanBtn").addEventListener("click", async () => {
  // get the current tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // run a content script function inside the page to get the email text
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractEmailContent
  }, async (results) => {
    const emailText = results[0].result;
    if (!emailText) {
      document.getElementById("result").innerHTML = "No email content found.";
      return;
    }

    // call your existing FastAPI backend
    const res = await fetch("http://3.216.62.101:8000/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: emailText })
    });
    const data = await res.json();

    document.getElementById("result").innerHTML = `
      <b>Risk:</b> ${data.risk_score}<br/>
      <b>Summary:</b> ${data.summary}<br/>
      <b>Flags:</b> ${data.flags.join(", ")}
    `;
  });
});

function extractEmailContent() {
  // Gmail-specific selector for email body
  let emailBody = document.querySelector(".a3s")?.innerText || "";
  return emailBody;
}