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
        loadEmailStats();  // ← Add this line
      } else if (section === 'gmail') {
        fetchGmailUnread();
        loadStoredEmails();
      } else if (section === 'ai') {
        loadAiUsage();
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
  fetch(`${base}/api/gmail/unread`)
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
        fetch(`${base}/api/gmail/classify`, { method: "POST" })
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
function loadStoredEmails() {
  const base = window.location.pathname.replace(/\/$/, "");
  const body = document.getElementById("gmail-email-body");
  body.innerHTML = `<tr><td colspan="2">Loading...</td></tr>`;

  fetch(`${base}/api/gmail/list`)
    .then(res => res.json())
    .then(data => {
      if (data.emails?.length) {
        body.innerHTML = "";
        data.emails.forEach(email => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${email.sender}</td>
            <td>${email.email}</td>
            <td>${email.subject}</td>
            <td>
              <select onchange="updateEmailCategory('${email.id}', this.value)">
                <option value="Uncategorized"${email.category === 'Uncategorized' ? ' selected' : ''}>❓ Uncategorized</option>
                <option value="Important"${email.category === 'Important' ? ' selected' : ''}>📌 Important</option>
                <option value="Data"${email.category === 'Data' ? ' selected' : ''}>📊 Data</option>
                <option value="Regular"${email.category === 'Regular' ? ' selected' : ''}>📬 Regular Mail</option>
                <option value="Spam"${email.category === 'Suspected Spam' ? ' selected' : ''}>🚫 Suspected Spam</option>
              </select>
            </td>
          `;
          body.appendChild(row);
        });
      } else {
        body.innerHTML = `<tr><td colspan="2">No emails stored.</td></tr>`;
      }
    })
    .catch(err => {
      console.error("Load email list error:", err);
      body.innerHTML = `<tr><td colspan="2">Failed to load email list.</td></tr>`;
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
