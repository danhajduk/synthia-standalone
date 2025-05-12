let watchdogInterval; // Interval for the watchdog status checker

/**
 * Dynamically loads a section of the application.
 * Fetches the corresponding HTML file and updates the content area.
 */
function loadSection(section) {
  const content = document.getElementById('content');
  if (watchdogInterval) clearInterval(watchdogInterval); // Clear watchdog if switching sections

  fetch(`static/pages/${section}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load ${section}`);
      }
      return response.text();
    })
    .then(html => {
      content.innerHTML = html;

      // Initialize specific logic for certain sections
      if (section === 'settings') {
        startWatchdog();
        loadEmailStats();
      } else if (section === 'gmail') {
        fetchGmailUnread();
        loadStoredEmails();
        loadGmailStats();
      } else if (section === 'ai') {
        loadAiUsage();
      } else if (section === 'reputation') {
        loadReputation();
      } else if (section === 'local_classifier') {
        fetchClassifierMetrics();
        fetchLastRun();
        loadLastLocalModelUse();
      }
    })
    .catch(error => {
      console.error(error);
      content.innerHTML = `<p>Error loading the ${section} section.</p>`;
    });
}

/**
 * Fetches a test message from the backend and displays it.
 */
async function getMessage() {
  const base = window.location.pathname.replace(/\/$/, "");
  const res = await fetch(`${base}/api/hello`);
  const data = await res.json();
  document.getElementById("message").textContent = data.message;
}

/**
 * Starts the watchdog to periodically check the backend status.
 */
function startWatchdog() {
  const base = window.location.pathname.replace(/\/$/, "");
  const statusCircle = document.getElementById("watchdog-status");
  const statusLabel = document.getElementById("watchdog-label");

  async function ping() {
    try {
      const res = await fetch(`${base}/api/hello`, { cache: "no-store" });
      if (res.ok) {
        statusCircle.style.backgroundColor = "limegreen";
        statusLabel.textContent = "Online";
      } else {
        statusCircle.style.backgroundColor = "red";
        statusLabel.textContent = "Unreachable";
      }
    } catch (e) {
      statusCircle.style.backgroundColor = "red";
      statusLabel.textContent = "Unreachable";
    }
  }

  ping(); // Immediate status check
  watchdogInterval = setInterval(ping, 20000); // Check every 20 seconds
}

/**
 * Fetches the count of unread Gmail emails for today.
 */
function fetchGmailUnread() {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/gmail/fetch/unread`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('gmail-unread-today').textContent = data.unread_today ?? '–';
    })
    .catch(err => {
      console.error("Gmail fetch error:", err);
      document.getElementById('gmail-unread-today').textContent = "Error";
    });
}

/**
 * Fetches and stores Gmail emails, then triggers classification.
 */
function fetchAndStoreEmails() {
  const base = window.location.pathname.replace(/\/$/, "");
  const resultDiv = document.getElementById("gmail-fetch-result");
  resultDiv.textContent = "Fetching... ⏳";

  fetch(`${base}/api/gmail/fetch`)
    .then(res => res.json())
    .then(data => {
      if (data.fetched !== undefined) {
        resultDiv.textContent = `✅ Fetched and stored ${data.fetched} email(s). Classifying...`;

        // Trigger classification
        fetch(`${base}/api/gmail/classify/ai_classify`, { method: "POST" })
          .then(res => res.json())
          .then(classifyData => {
            resultDiv.textContent += ` ✅ Classified ${classifyData.classified} email(s).`;
            loadStoredEmails(); // Refresh the table after classification
          })
          .catch(err => {
            console.error("Classification error:", err);
            resultDiv.textContent += " ❌ Classification failed.";
          });
      } else {
        resultDiv.textContent = `⚠️ Error: ${data.error}`;
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      resultDiv.textContent = "❌ Failed to fetch emails.";
    });
}

/**
 * Loads the list of stored Gmail emails and displays them in a table.
 */
async function loadStoredEmails() {
  const base = window.location.pathname.replace(/\/$/, "");
  const body = document.getElementById("gmail-email-body");
  const filterSender = document.getElementById("filter-sender");
  const filterCategory = document.getElementById("filter-category");

  body.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

  try {
    const [emailsRes, labelsRes] = await Promise.all([
      fetch(`${base}/api/gmail/list`).then(res => res.json()),
      fetch(`${base}/api/gmail/labels`).then(res => res.json())
    ]);

    const emails = emailsRes.emails ?? [];
    const labels = labelsRes.labels ?? [];

    // Populate filter dropdowns if empty
    if (filterSender.options.length <= 1) {
      const uniqueSenders = [...new Set(emails.map(e => e.email))].sort();
      uniqueSenders.forEach(sender => {
        const opt = document.createElement("option");
        opt.value = sender;
        opt.textContent = sender;
        filterSender.appendChild(opt);
      });
    }

    if (filterCategory.options.length <= 1) {
      labels.forEach(label => {
        const opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        filterCategory.appendChild(opt);
      });
    }

    // Apply filters
    const senderFilter = filterSender.value;
    const categoryFilter = filterCategory.value;

    const filtered = emails.filter(email => {
      return (!senderFilter || email.email === senderFilter) &&
             (!categoryFilter || email.category === categoryFilter);
    });

    if (filtered.length === 0) {
      body.innerHTML = `<tr><td colspan="5">No emails match your filters.</td></tr>`;
      return;
    }

    body.innerHTML = "";
    filtered.forEach(email => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${email.sender}</td>
        <td>${email.email}</td>
        <td>${email.subject}</td>
        <td>
          <select onchange="updateEmailCategory('${email.id}', this.value)">
            ${labels.map(label =>
              `<option value="${label}"${email.category === label ? " selected" : ""}>${label}</option>`
            ).join("")}
          </select>
        </td>
        <td>${email.predicted_by === "local" && email.confidence ? `⚙️ Local (${email.confidence.toFixed(0)}%)`
              : email.predicted_by === "openai" ? "🤖 OpenAI"
              : email.predicted_by === "manual" ? "✍️ Manual"
              : "–"}
        </td>
      `;
      body.appendChild(row);
    });

  } catch (err) {
    console.error("Load email list error:", err);
    body.innerHTML = `<tr><td colspan="5">Failed to load email list.</td></tr>`;
  }
}

/**
 * Fetches and displays Gmail statistics.
 */
function loadGmailStats() {
  const base = window.location.pathname.replace(/\/$/, "");

  fetch(`${base}/api/gmail/stats`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("gmail-total-count").textContent = data.total ?? "–";
      document.getElementById("gmail-uncategorized-count").textContent = data.unclassified ?? "–";
    })
    .catch(err => {
      console.error("Failed to load Gmail stats", err);
    });
}

/**
 * Fetches and displays sender reputation data.
 */
function loadReputation() {
  const base = window.location.pathname.replace(/\/$/, "");
  const body = document.getElementById("reputation-table-body");
  body.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  fetch(`${base}/api/gmail/reputation`)
    .then(res => res.json())
    .then(data => {
      const senders = data.senders ?? [];
      if (senders.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No data available.</td></tr>`;
        return;
      }

      body.innerHTML = "";
      senders.forEach(sender => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sender.email}</td>
          <td>${sender.name}</td>
          <td>${sender.score.toFixed(2)}</td>
          <td>${sender.state}</td>
          <td>${Object.entries(sender.counts).map(([label, count]) => `${label}: ${count}`).join(", ")}</td>
          <td>${new Date(sender.updated).toLocaleString()}</td>
        `;
        body.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Sender reputation fetch error:", err);
      body.innerHTML = `<tr><td colspan="6">Error loading reputation data.</td></tr>`;
    });
}

/**
 * Sends a chat message to the AI assistant and displays the response.
 */
function sendChat() {
  const base = window.location.pathname.replace(/\/$/, "");
  const input = document.getElementById("chat-input");
  const output = document.getElementById("chat-output");

  const message = input.value.trim();
  if (!message) return;

  output.textContent = "Thinking... 🤖";

  fetch(`${base}/api/openai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => {
      output.textContent = data.reply ?? `⚠️ ${data.error}`;
    })
    .catch(err => {
      console.error(err);
      output.textContent = "❌ Failed to get a response.";
    });
}

/**
 * Fetches and displays monthly OpenAI usage statistics.
 */
function loadAiUsage() {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/ai/usage`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("this-month-cost").textContent = data.this_month?.toFixed(4) ?? "–";
      document.getElementById("last-month-cost").textContent = data.last_month?.toFixed(4) ?? "–";
    })
    .catch(err => {
      console.error("AI usage fetch error:", err);
    });
}

/**
 * Updates the category of a specific email.
 */
function updateEmailCategory(emailId, category) {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/gmail/categorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: emailId, category })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "updated") {
        alert("Failed to update category.");
      }
    })
    .catch(err => {
      console.error("Update category error:", err);
      alert("Failed to update category.");
    });
}

function checkSpamhaus() {
  const base = window.location.pathname.replace(/\/$/, "");
  const resultDiv = document.getElementById("spamhaus-check-result");
  resultDiv.textContent = "Checking... ⏳";

  fetch(`${base}/api/gmail/check_spamhaus`)
    .then(res => res.json())
    .then(data => {
      resultDiv.textContent = `🔍 Checked ${data.count} emails. See log for results.`;
    })
    .catch(err => {
      console.error("Spamhaus check error:", err);
      resultDiv.textContent = "❌ Error during check.";
    });
}

function clearAllTables() {
  const base = window.location.pathname.replace(/\/$/, "");
  const status = document.getElementById("clear-all-status");
  status.textContent = "⏳ Clearing...";

  fetch(`${base}/api/clear_all_tables`, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        status.textContent = "✅ All tables cleared.";
      } else {
        status.textContent = `❌ ${data.error}`;
      }
    })
    .catch(err => {
      console.error("Clear error:", err);
      status.textContent = "❌ Request failed.";
    });
}

function loadEmailStats() {
  const base = window.location.pathname.replace(/\/$/, "");
  const statsTotal = document.getElementById("email-total");
  const statsUncat = document.getElementById("email-uncategorized");

  fetch(`${base}/api/gmail/stats`)
    .then(res => res.json())
    .then(data => {
      statsTotal.textContent = data.total ?? "–";
      statsUncat.textContent = data.uncategorized ?? "–";
    })
    .catch(err => {
      console.error("Stats fetch error:", err);
      statsTotal.textContent = "❌";
      statsUncat.textContent = "❌";
    });
}

// Debug section

function debugFetchBack14() {
  const status = document.getElementById("debug-status");
  status.textContent = "⏳ Fetching emails (last 14 days)...";

  fetch("/api/gmail/debug/fetch14")
    .then(res => res.json())
    .then(data => {
      status.textContent = `✅ Fetched ${data.fetched || 0} emails.`;
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Failed to fetch.";
    });
}

function debugClassifyAll() {
  const status = document.getElementById("debug-status");
  status.textContent = "⏳ Classifying emails...";

  fetch("/api/gmail/debug/classify-all")
    .then(res => res.json())
    .then(data => {
      status.textContent = `✅ Classified ${data.total || 0} emails.`;
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Failed to classify.";
    });
}

function debugCopyEmailTable() {
  const status = document.getElementById("debug-status");
  status.textContent = "⏳ Copying email table...";

  fetch("/api/gmail/debug/backup", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      status.textContent = data.message || "✅ Backup complete.";
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Backup failed.";
    });
}

function debugRestoreEmailTable() {
  const status = document.getElementById("debug-status");
  status.textContent = "⏳ Restoring email table...";

  fetch("/api/gmail/debug/restore", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      status.textContent = data.message || "✅ Restore complete.";
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Restore failed.";
    });
}

function aiClassifyEmails() {
  const base = window.location.pathname.replace(/\/$/, "");
  const resultDiv = document.getElementById("gmail-fetch-result");
  resultDiv.textContent = "🧠 Classifying with AI...";

  fetch(`${base}/api/gmail/ai_classify`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.classified !== undefined) {
        resultDiv.textContent = `✅ AI classified ${data.classified} email(s).`;
        loadStoredEmails();
      } else {
        resultDiv.textContent = `⚠️ AI Error: ${data.error}`;
      }
    })
    .catch(err => {
      console.error("AI classify error:", err);
      resultDiv.textContent = "❌ AI classification failed.";
    });
}

function trainOnManual() {
  const base = window.location.pathname.replace(/\/$/, "");
  const status = document.getElementById("train-status");
  status.textContent = "🔁 Training on manual labels...";

  fetch(`${base}/api/gmail/train/manual`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      status.textContent = `✅ Training started on ${data.source} labels.`;
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Training failed.";
    });
}

function trainOnOpenAI() {
  const base = window.location.pathname.replace(/\/$/, "");
  const status = document.getElementById("train-status");
  status.textContent = "🔁 Training on OpenAI labels...";

  fetch(`${base}/api/gmail/train/openai`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      status.textContent = `✅ Training started on ${data.source} labels.`;
    })
    .catch(err => {
      console.error(err);
      status.textContent = "❌ Training failed.";
    });
}

function loadReputation() {
  const base = window.location.pathname.replace(/\/$/, "");
  const body = document.getElementById("reputation-table-body");
  body.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  function reputationIcon(score) {
    if (score >= 0.9) return "🌟";     // Excellent
    if (score >= 0.7) return "✅";     // Good
    if (score >= 0.4) return "⚠️";     // Moderate
    if (score >= 0.1) return "🚫";     // Poor
    return "❗";                       // Very bad / unknown
  }

  fetch(`${base}/api/gmail/reputation`)
    .then(res => res.json())
    .then(data => {
      const senders = data.senders ?? [];
      if (senders.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No data available.</td></tr>`;
        return;
      }

      body.innerHTML = "";
      senders.forEach(sender => {
        const icon = reputationIcon(sender.score ?? 0);
        const counts = Object.entries(sender.counts || {})
          .map(([label, count]) => `<span style="margin-right: 6px;">${label}: <strong>${count}</strong></span>`)
          .join("");

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sender.email}</td>
          <td>${sender.name}</td>
          <td>${icon} ${(sender.score ?? 0).toFixed(2)}</td>
          <td>${sender.state}</td>
          <td style="font-size: 0.9em;">${counts}</td>
          <td><span style="background:#e0e0e0;padding:2px 6px;border-radius:4px;font-size:0.85em;">${new Date(sender.updated).toLocaleString()}</span></td>
        `;
        body.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Sender reputation fetch error:", err);
      body.innerHTML = `<tr><td colspan="6">Error loading reputation data.</td></tr>`;
    });
}
function recalculateReputation() {
  const base = window.location.pathname.replace(/\/$/, "");
  const statusDiv = document.getElementById("reputation-recalc-status");
  statusDiv.textContent = "⏳ Recalculating...";

  fetch(`${base}/api/gmail/reputation/recalculate`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.status === "recalculated") {
        statusDiv.textContent = `✅ Updated ${data.senders_updated} senders.`;
        loadReputation();
      } else {
        statusDiv.textContent = `❌ ${data.error || "Update failed."}`;
      }
    })
    .catch(err => {
      console.error("Reputation update error:", err);
      statusDiv.textContent = "❌ Request failed.";
    });
}


function fetchClassifierMetrics() {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/gmail/classifier/metrics`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#metrics-table tbody");
      tbody.innerHTML = data.metrics.map(row =>
        `<tr><td>${row.label}</td><td>${row.precision}</td><td>${row.recall}</td><td>${row.f1}</td><td>${row.support}</td></tr>`
      ).join("");
    });
}

function fetchLastRun() {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/gmail/classifier/last_run`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("last-run-time").textContent = data.last_run || "–";
    });
}

function loadLastLocalModelUse() {
  const base = window.location.pathname.replace(/\/$/, "");
  const display = document.getElementById("last-local-use");

  fetch(`${base}/api/classifier/last_used`)
    .then(res => res.json())
    .then(data => {
      display.textContent = data.last_used
        ? `🕒 Last used: ${new Date(data.last_used).toLocaleString()}`
        : "⏱️ Never used yet.";
    })
    .catch(err => {
      console.error("Error loading last classifier usage:", err);
      display.textContent = "⚠️ Error loading last use timestamp.";
    });
}

function clearTrainingData() {
  fetch('/api/gmail/train/clear', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      alert("✅ Training data cleared.");
    })
    .catch(err => {
      console.error("❌ Clear training data error:", err);
      alert("❌ Failed to clear training data.");
    });
}

function retrainFromScratch() {
  fetch('/api/gmail/train/retrain_all', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      alert("✅ Model retrained from scratch.");
    })
    .catch(err => {
      console.error("❌ Retraining failed:", err);
      alert("❌ Failed to retrain model.");
    });
}

function trainManual24() {
  fetch('/api/gmail/train/manual24', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      alert("✅ Manual tags (last 24h) used for training.");
    })
    .catch(err => {
      console.error("❌ Manual training failed:", err);
      alert("❌ Failed to train on manual tags.");
    });
}

function trainAi24() {
  fetch('/api/gmail/train/ai24', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      alert("✅ AI tags (last 24h) used for training.");
    })
    .catch(err => {
      console.error("❌ AI training failed:", err);
      alert("❌ Failed to train on AI tags.");
    });
}
function fetchTotalEmails() {
  const base = window.location.pathname.replace(/\/$/, "");
  fetch(`${base}/api/gmail/count`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("gmail-total-emails").textContent = data.total_emails ?? "–";
    })
    .catch(err => {
      console.error("Total email count fetch error:", err);
      document.getElementById("gmail-total-emails").textContent = "Error";
    });
}
