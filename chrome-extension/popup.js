document.getElementById("scanBtn").addEventListener("click", async () => {
  document.getElementById("loading").style.display = "block";
  document.getElementById("result").innerHTML = "";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  }, async (results) => {
    const emailText = results[0].result;

    if (!emailText) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("result").innerHTML = "⚠️ No email content found.";
      return;
    }

    try {
      const res = await fetch("http://3.216.62.101:8000/analyze", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: emailText })
      });

      const data = await res.json();
      document.getElementById("loading").style.display = "none";

      let riskClass = "risk-low";
      if (data.risk_score > 70) riskClass = "risk-high";
      else if (data.risk_score > 30) riskClass = "risk-medium";

      document.getElementById("result").innerHTML = `
        <div><b>Risk Score:</b> <span class="${riskClass}">${data.risk_score}</span></div>
        <div><b>Summary:</b> ${data.summary}</div>
        <div><b>Flags:</b> ${data.flags.join(", ")}</div>
      `;
    } catch (err) {
      console.error(err);
      document.getElementById("loading").style.display = "none";
      document.getElementById("result").innerHTML = "🚨 Error analyzing email.";
    }
  });
});
