/**
 * TPay - Modern White & Sky Blue Fintech Portal
 * Strict Sequential Flow:
 * Phase 1: Pure Fullscreen Splash -> Phase 2: Fullscreen Password (2009) -> Phase 3: Dashboard & Account
 * User: Hassan Khan | PIN: 2009 | Balance: 500k
 */

const DEFAULT_BALANCE = 500000.00;
const REQUIRED_PIN = "2009";

const INITIAL_TRANSACTIONS = [
  {
    id: "488274323",
    title: "Transfer to TEMOOR SHAH",
    type: "send",
    amount: "-260.00",
    date: "Today, 6:53 PM",
    meta: "Easypaisa • Raast Instant"
  },
  {
    id: "488192004",
    title: "Received from Raqmi Islamic Bank",
    type: "receive",
    amount: "+50,000.00",
    date: "Today, 02:40 PM",
    meta: "Interbank Raqmi Transfer • UTR #88192"
  },
  {
    id: "488109231",
    title: "Al-Fatah Supermarket",
    type: "send",
    amount: "-6,450.00",
    date: "Yesterday, 08:15 PM",
    meta: "POS Merchant Payment"
  },
  {
    id: "487992019",
    title: "Jazz Super Card Extreme",
    type: "topup",
    amount: "-1,500.00",
    date: "15 Oct, 11:20 AM",
    meta: "Mobile Prepaid Recharge • 0300-8822009"
  }
];

class TPayPortal {
  constructor() {
    this.balance = this.loadBalance();
    this.transactions = this.loadTransactions();
    this.enteredPin = "";
    this.isBalanceHidden = true;
    this.splashDuration = 1300; // Fast smooth splash (1.3 seconds)
    this.splashTimer = null;

    this.initElements();
    this.bindEvents();
    this.check24hAutoReplenish();
    this.updateBalanceDisplay();
    this.renderTransactions();
    this.startSplashIntro();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Persistence & 24h Auto-Refill ---
  loadBalance() {
    const saved = localStorage.getItem("tpay_hassan_balance");
    return saved !== null ? parseFloat(saved) : DEFAULT_BALANCE;
  }

  saveBalance(amt) {
    this.balance = amt;
    localStorage.setItem("tpay_hassan_balance", amt.toString());
    localStorage.setItem("tpay_hassan_last_cycle", Date.now().toString());
    this.updateBalanceDisplay();
  }

  check24hAutoReplenish() {
    const lastCycle = localStorage.getItem("tpay_hassan_last_cycle");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastCycle || (now - parseInt(lastCycle)) >= oneDay) {
      this.saveBalance(DEFAULT_BALANCE);
    }
  }

  loadTransactions() {
    const saved = localStorage.getItem("tpay_hassan_txs");
    return saved ? JSON.parse(saved) : [...INITIAL_TRANSACTIONS];
  }

  saveTransactions() {
    localStorage.setItem("tpay_hassan_txs", JSON.stringify(this.transactions));
    this.renderTransactions();
  }

  // --- Elements Binding ---
  initElements() {
    // Stage Screens
    this.splashScreen = document.getElementById("splashScreen");
    this.lockScreen = document.getElementById("lockScreen");
    this.dashboardScreen = document.getElementById("dashboardScreen");
    this.sendScreen = document.getElementById("sendScreen");

    // Splash Elements
    this.splashFillBar = document.getElementById("splashFillBar");

    // PIN Elements
    this.pinDots = [
      document.getElementById("pindot-0"),
      document.getElementById("pindot-1"),
      document.getElementById("pindot-2"),
      document.getElementById("pindot-3")
    ];
    this.keypadButtons = document.querySelectorAll(".keypad-grid-clean .keypad-button[data-val]");
    this.btnDeletePin = document.getElementById("btnDeletePin");
    this.btnBiometricAuth = document.getElementById("btnBiometricAuth");

    // Dashboard Elements
    this.dashBalanceDisplay = document.getElementById("dashBalanceDisplay");
    this.btnEyeToggle = document.getElementById("btnEyeToggle");
    this.btnCardRefill500k = document.getElementById("btnCardRefill500k");
    this.activityFeedContainer = document.getElementById("activityFeedContainer");
    this.btnResetTxFeed = document.getElementById("btnResetTxFeed");
    this.btnUserProfile = document.getElementById("btnUserProfile");
    this.btnNotifications = document.getElementById("btnNotifications");

    // Action Triggers
    this.btnTriggerSend = document.getElementById("btnTriggerSend");
    this.btnTriggerRequest = document.getElementById("btnTriggerRequest");
    this.btnTriggerBills = document.getElementById("btnTriggerBills");

    // Bottom Navigation
    this.bottomNavSend = document.getElementById("bottomNavSend");
    this.bottomNavCards = document.getElementById("bottomNavCards");
    this.bottomNavProfile = document.getElementById("bottomNavProfile");

    // Send Form & Navigation
    this.btnBackFromSend = document.getElementById("btnBackFromSend");
    this.sendDestinationBank = document.getElementById("sendDestinationBank");
    this.sendRecipientName = document.getElementById("sendRecipientName");
    this.sendRecipientAccount = document.getElementById("sendRecipientAccount");
    this.sendAmountField = document.getElementById("sendAmountField");
    this.sendPurposeSelect = document.getElementById("sendPurposeSelect");
    this.btnExecuteSend = document.getElementById("btnExecuteSend");

    // Modals
    this.modalOfficialReceipt = document.getElementById("modalOfficialReceipt");

    // Ticket Receipt Elements (Raqmi style)
    this.receiptDispAmount = document.getElementById("receiptDispAmount");
    this.receiptDispTime = document.getElementById("receiptDispTime");
    this.receiptDispRecipient = document.getElementById("receiptDispRecipient");
    this.receiptDispAccount = document.getElementById("receiptDispAccount");
    this.receiptDispRef = document.getElementById("receiptDispRef");
    this.receiptDispChannel = document.getElementById("receiptDispChannel");
    this.btnPrintReceipt = document.getElementById("btnPrintReceipt");
    this.btnCloseReceiptModal = document.getElementById("btnCloseReceiptModal");
  }

  // --- Event Handling ---
  bindEvents() {
    // Quick Balance Refill inside debit card
    if (this.btnCardRefill500k) {
      this.btnCardRefill500k.addEventListener("click", () => {
        this.saveBalance(DEFAULT_BALANCE);
        this.notify("Wallet refilled to ₨ 500,000.00");
      });
    }

    // Profile & Notifications
    if (this.btnUserProfile) {
      this.btnUserProfile.addEventListener("click", () => {
        this.notify("Hassan Khan • Account PK92 TPAY 8822 2009");
      });
    }

    if (this.btnNotifications) {
      this.btnNotifications.addEventListener("click", () => {
        this.notify("No new notifications");
      });
    }

    // PIN Keypad
    this.keypadButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val");
        this.inputPinDigit(val);
      });
    });

    this.btnDeletePin.addEventListener("click", () => this.deletePinDigit());
    this.btnBiometricAuth.addEventListener("click", () => {
      this.enteredPin = REQUIRED_PIN;
      this.updatePinDots();
      setTimeout(() => this.unlockDashboard(), 200);
    });

    // Eye toggle
    this.btnEyeToggle.addEventListener("click", () => {
      this.isBalanceHidden = !this.isBalanceHidden;
      this.updateBalanceDisplay();
    });

    // Reset feed
    this.btnResetTxFeed.addEventListener("click", () => {
      this.transactions = [...INITIAL_TRANSACTIONS];
      this.saveTransactions();
      this.notify("Activity feed restored");
    });

    // Action Triggers
    if (this.btnTriggerSend) {
      this.btnTriggerSend.addEventListener("click", () => this.showScreen("sendScreen"));
    }

    if (this.bottomNavSend) {
      this.bottomNavSend.addEventListener("click", () => this.showScreen("sendScreen"));
    }
    if (this.bottomNavCards) {
      this.bottomNavCards.addEventListener("click", () => {
        this.notify("TPay Virtual Platinum Card: Active");
      });
    }
    if (this.bottomNavProfile) {
      this.bottomNavProfile.addEventListener("click", () => {
        this.enteredPin = "";
        this.updatePinDots();
        this.showScreen("lockScreen");
      });
    }

    if (this.btnTriggerRequest) {
      this.btnTriggerRequest.addEventListener("click", () => {
        this.notify("Payment link generated: tpay.me/hassan_khan");
      });
    }

    if (this.btnTriggerBills) {
      this.btnTriggerBills.addEventListener("click", () => {
        this.notify("Bills Portal: LESCO, SNGPL, PTCL connected");
      });
    }

    // Modal Close
    document.querySelectorAll("[data-dismiss]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-dismiss");
        this.closeModal(document.getElementById(targetId));
      });
    });

    // Quick Bank Filter Badges
    document.querySelectorAll("#quickBankBadges .quick-chip").forEach(badge => {
      badge.addEventListener("click", () => {
        document.querySelectorAll("#quickBankBadges .quick-chip").forEach(b => b.classList.remove("active"));
        badge.classList.add("active");
        const bankVal = badge.getAttribute("data-quickbank");
        if (bankVal && this.sendDestinationBank) {
          this.sendDestinationBank.value = bankVal;
        }
      });
    });

    // Quick Beneficiaries
    document.querySelectorAll("#contactsRow .quick-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const name = chip.getAttribute("data-name");
        const iban = chip.getAttribute("data-iban");
        const bank = chip.getAttribute("data-bank");
        if (this.sendRecipientName) {
          this.sendRecipientName.value = name || "";
        }
        if (this.sendRecipientAccount) {
          this.sendRecipientAccount.value = iban || "";
        }
        if (bank && this.sendDestinationBank) {
          this.sendDestinationBank.value = bank;
        }
      });
    });

    // Quick Send Amounts
    document.querySelectorAll("#sendScreen [data-amt]").forEach(chip => {
      chip.addEventListener("click", () => {
        if (this.sendAmountField) {
          this.sendAmountField.value = chip.getAttribute("data-amt");
        }
      });
    });

    // Execute Send
    if (this.btnExecuteSend) {
      this.btnExecuteSend.addEventListener("click", () => this.processSendMoney());
    }

    // Back from Send Screen
    if (this.btnBackFromSend) {
      this.btnBackFromSend.addEventListener("click", () => this.showScreen("dashboardScreen"));
    }

    // Print / Save Receipt
    if (this.btnPrintReceipt) {
      this.btnPrintReceipt.addEventListener("click", () => {
        window.print();
      });
    }

    // Close Receipt Modal
    if (this.btnCloseReceiptModal) {
      this.btnCloseReceiptModal.addEventListener("click", () => {
        this.closeModal(this.modalOfficialReceipt);
      });
    }
  }

  // --- Splash Engine ---
  startSplashIntro() {
    if (this.splashTimer) clearInterval(this.splashTimer);

    let progress = 0;
    const step = 40;
    this.splashFillBar.style.width = "0%";

    this.splashTimer = setInterval(() => {
      progress += step;
      const pct = Math.min(100, (progress / this.splashDuration) * 100);
      this.splashFillBar.style.width = pct + "%";

      if (progress >= this.splashDuration) {
        clearInterval(this.splashTimer);
        this.finishSplash();
      }
    }, step);
  }

  finishSplash() {
    if (this.splashTimer) clearInterval(this.splashTimer);
    this.showScreen("lockScreen");
  }

  // --- Strict Stage Switcher ---
  showScreen(screenId) {
    document.querySelectorAll(".stage-screen").forEach(scr => {
      scr.classList.remove("is-active-stage");
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("is-active-stage");
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // --- PIN / Password Logic (Pass: 2009) ---
  inputPinDigit(digit) {
    if (this.enteredPin.length < 4) {
      this.enteredPin += digit;
      this.updatePinDots();

      if (this.enteredPin.length === 4) {
        setTimeout(() => {
          if (this.enteredPin === REQUIRED_PIN) {
            this.unlockDashboard();
          } else {
            this.shakePinError();
          }
        }, 180);
      }
    }
  }

  deletePinDigit() {
    if (this.enteredPin.length > 0) {
      this.enteredPin = this.enteredPin.slice(0, -1);
      this.updatePinDots();
    }
  }

  updatePinDots() {
    this.pinDots.forEach((dot, i) => {
      if (i < this.enteredPin.length) {
        dot.classList.add("is-filled");
      } else {
        dot.classList.remove("is-filled");
        dot.classList.remove("is-error");
      }
    });
  }

  shakePinError() {
    this.pinDots.forEach(dot => dot.classList.add("is-error"));
    this.notify("Incorrect PIN! Enter '2009'");
    setTimeout(() => {
      this.enteredPin = "";
      this.updatePinDots();
    }, 600);
  }

  unlockDashboard() {
    this.pinDots.forEach(dot => dot.classList.add("is-filled"));
    setTimeout(() => {
      this.showScreen("dashboardScreen");
      this.enteredPin = "";
      this.updatePinDots();
      this.notify("Welcome back, Hassan Khan");
    }, 250);
  }

  // --- Balance Display ---
  updateBalanceDisplay() {
    const label = document.getElementById("balanceToggleLabel");
    if (this.isBalanceHidden) {
      this.dashBalanceDisplay.textContent = "••••••••";
      if (label) label.textContent = "Show";
    } else {
      this.dashBalanceDisplay.textContent = this.formatCurrency(this.balance);
      if (label) label.textContent = "Hide";
    }
  }

  formatCurrency(num) {
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // --- Transactions Feed ---
  renderTransactions() {
    this.activityFeedContainer.innerHTML = "";
    this.transactions.forEach(tx => {
      const item = document.createElement("div");
      item.className = "activity-row";

      let iconHtml = '<i data-lucide="arrow-up-right" style="width: 18px; height: 18px;"></i>';
      let isNegative = true;

      if (tx.type === "receive") {
        iconHtml = '<i data-lucide="arrow-down-left" style="width: 18px; height: 18px;"></i>';
        isNegative = false;
      } else if (tx.type === "topup") {
        iconHtml = '<i data-lucide="smartphone" style="width: 18px; height: 18px;"></i>';
      }

      item.innerHTML = `
        <div class="act-left">
          <div class="act-icon-box ${tx.type}">
            ${iconHtml}
          </div>
          <div>
            <div class="act-text-main">${tx.title}</div>
            <div class="act-text-meta">${tx.date} • ${tx.meta}</div>
          </div>
        </div>
        <div class="act-amt-block">
          <div class="act-amt-text ${isNegative ? 'negative' : 'positive'}">₨ ${tx.amount}</div>
          <div class="act-tag-completed">Completed</div>
        </div>
      `;
      this.activityFeedContainer.appendChild(item);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Send Money Flow ---
  processSendMoney() {
    const bank = this.sendDestinationBank ? this.sendDestinationBank.value : "Easypaisa";
    const recipientName = (this.sendRecipientName ? this.sendRecipientName.value.trim() : "");
    const recipientAccount = (this.sendRecipientAccount ? this.sendRecipientAccount.value.trim() : "");
    const amount = parseFloat(this.sendAmountField ? this.sendAmountField.value : "0");
    const purpose = this.sendPurposeSelect ? this.sendPurposeSelect.value : "Transfer";

    if (!recipientName) {
      alert("Please enter the Beneficiary / Receiver Name.");
      if (this.sendRecipientName) this.sendRecipientName.focus();
      return;
    }
    if (!recipientAccount) {
      alert("Please enter recipient account number or mobile wallet.");
      if (this.sendRecipientAccount) this.sendRecipientAccount.focus();
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter a valid transfer amount.");
      if (this.sendAmountField) this.sendAmountField.focus();
      return;
    }
    if (amount > this.balance) {
      alert("Insufficient available balance.");
      return;
    }

    if (this.btnExecuteSend) {
      this.btnExecuteSend.disabled = true;
      this.btnExecuteSend.innerHTML = `<span>Processing via Raast...</span>`;
    }

    setTimeout(() => {
      if (this.btnExecuteSend) {
        this.btnExecuteSend.disabled = false;
        this.btnExecuteSend.innerHTML = `<span>Proceed & Send</span> <i data-lucide="arrow-right"></i>`;
      }

      // Deduct balance
      const newBal = this.balance - amount;
      this.saveBalance(newBal);

      // Extract last 4 characters for mask
      const cleanAcct = recipientAccount.replace(/[^0-9a-zA-Z]/g, "");
      const last4 = "*" + (cleanAcct.length >= 4 ? cleanAcct.slice(-4) : cleanAcct);

      // 9-digit Raast Transaction ID
      const refId = Math.floor(400000000 + Math.random() * 590000000).toString();

      // Format date like: "Sent at 6:53 PM on 17 Oct 26"
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const day = now.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear().toString().slice(-2);
      const formattedTimestamp = `Sent at ${hours}:${minutes} ${ampm} on ${day} ${month} ${year}`;

      // Add to transaction feed
      const newTx = {
        id: refId,
        title: `Transfer to ${recipientName.toUpperCase()}`,
        type: "send",
        amount: `-${this.formatCurrency(amount)}`,
        date: "Just now",
        meta: `${bank} • Raast Instant`
      };
      this.transactions.unshift(newTx);
      this.saveTransactions();

      // Clear input fields
      if (this.sendRecipientName) this.sendRecipientName.value = "";
      if (this.sendRecipientAccount) this.sendRecipientAccount.value = "";
      if (this.sendAmountField) this.sendAmountField.value = "";

      // Return to dashboard
      this.showScreen("dashboardScreen");

      // Show realistic Raast/Raqmi slip/receipt modal
      this.showReceiptModal({
        amountStr: `Rs. ${this.formatCurrency(amount).replace('.00', '')}`,
        timestamp: formattedTimestamp,
        recipient: recipientName.toUpperCase(),
        accountMask: last4,
        bank: bank,
        ref: refId,
        channel: "Raast"
      });
    }, 800);
  }

  // --- Show Exact Ticket Receipt ---
  showReceiptModal(data) {
    if (this.receiptDispAmount) this.receiptDispAmount.textContent = data.amountStr;
    if (this.receiptDispTime) this.receiptDispTime.textContent = data.timestamp;
    if (this.receiptDispRecipient) this.receiptDispRecipient.textContent = data.recipient;
    if (this.receiptDispAccount) this.receiptDispAccount.textContent = data.accountMask;
    if (this.receiptDispRef) this.receiptDispRef.textContent = data.ref;
    if (this.receiptDispChannel) this.receiptDispChannel.textContent = data.channel;

    if (!this.modalOfficialReceipt) {
      this.modalOfficialReceipt = document.getElementById("modalOfficialReceipt");
    }
    if (this.modalOfficialReceipt) {
      this.openModal(this.modalOfficialReceipt);
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Modals Helper ---
  openModal(modal) {
    if (modal) {
      modal.classList.add("is-open");
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove("is-open");
    }
  }

  // --- Toast Notifications ---
  notify(msg) {
    let toast = document.getElementById("skyToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "skyToast";
      toast.style.position = "fixed";
      toast.style.bottom = "74px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.background = "#0F172A";
      toast.style.color = "#FFFFFF";
      toast.style.padding = "10px 22px";
      toast.style.borderRadius = "30px";
      toast.style.fontSize = "13px";
      toast.style.fontWeight = "700";
      toast.style.zIndex = "9999999";
      toast.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
      toast.style.transition = "opacity 0.3s ease";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2800);
  }
}

// Start Portal
document.addEventListener("DOMContentLoaded", () => {
  window.portal = new TPayPortal();
});
