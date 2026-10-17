/**
 * TPay - Modern White & Sky Blue Fintech Web Portal
 * Strict Sequential Flow:
 * Phase 1: Pure Fullscreen Splash (5s) -> Phase 2: Pure Fullscreen Password (2009) -> Phase 3: Dashboard & Account
 * User: Hassan Khan | PIN: 2009 | Balance: 500k
 */

const DEFAULT_BALANCE = 500000.00;
const REQUIRED_PIN = "2009";

const INITIAL_TRANSACTIONS = [
  {
    id: "TP-2026-90412",
    title: "Received from Raqmi Islamic Bank",
    type: "receive",
    amount: "+50,000.00",
    date: "Today, 02:40 PM",
    meta: "Interbank Raqmi Transfer • UTR #88192"
  },
  {
    id: "TP-2026-88319",
    title: "Al-Fatah Supermarket",
    type: "send",
    amount: "-6,450.00",
    date: "Yesterday, 08:15 PM",
    meta: "POS Merchant Payment"
  },
  {
    id: "TP-2026-77102",
    title: "Jazz Super Card Extreme",
    type: "topup",
    amount: "-1,500.00",
    date: "15 Oct, 11:20 AM",
    meta: "Mobile Prepaid Recharge • 0300-8822009"
  },
  {
    id: "TP-2026-66491",
    title: "Client Retainer Payment",
    type: "receive",
    amount: "+150,000.00",
    date: "12 Oct, 09:30 AM",
    meta: "Inward Business Remittance"
  }
];

class TPayPortal {
  constructor() {
    this.balance = this.loadBalance();
    this.transactions = this.loadTransactions();
    this.enteredPin = "";
    this.isBalanceHidden = false;
    this.splashDuration = 5000; // 5 seconds
    this.splashTimer = null;
    this.selectedCarrier = "Jazz";

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

    // Splash Elements
    this.splashFillBar = document.getElementById("splashFillBar");
    this.splashTimerLabel = document.getElementById("splashTimerLabel");
    this.btnSkipSplash = document.getElementById("btnSkipSplash");

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

    // Top Controls
    this.btnTopResetBalance = document.getElementById("btnTopResetBalance");
    this.btnTopReplaySplash = document.getElementById("btnTopReplaySplash");
    this.btnTopLock = document.getElementById("btnTopLock");

    // Action Triggers
    this.btnTriggerSend = document.getElementById("btnTriggerSend");
    this.btnTriggerTopup = document.getElementById("btnTriggerTopup");
    this.btnTriggerRequest = document.getElementById("btnTriggerRequest");
    this.btnTriggerBills = document.getElementById("btnTriggerBills");

    // Modals
    this.modalSendMoney = document.getElementById("modalSendMoney");
    this.modalTopup = document.getElementById("modalTopup");
    this.modalOfficialReceipt = document.getElementById("modalOfficialReceipt");

    // Send Form
    this.sendDestinationBank = document.getElementById("sendDestinationBank");
    this.sendRecipientAccount = document.getElementById("sendRecipientAccount");
    this.sendAmountField = document.getElementById("sendAmountField");
    this.sendPurposeSelect = document.getElementById("sendPurposeSelect");
    this.btnExecuteSend = document.getElementById("btnExecuteSend");

    // Topup Form
    this.topupPhoneNumber = document.getElementById("topupPhoneNumber");
    this.topupAmountInput = document.getElementById("topupAmountInput");
    this.btnExecuteTopup = document.getElementById("btnExecuteTopup");
    this.carrierCards = document.querySelectorAll(".carrier-card-item");

    // Receipt Elements
    this.receiptDispAmount = document.getElementById("receiptDispAmount");
    this.receiptDispAmountWords = document.getElementById("receiptDispAmountWords");
    this.receiptDispRecipient = document.getElementById("receiptDispRecipient");
    this.receiptDispBank = document.getElementById("receiptDispBank");
    this.receiptDispAccount = document.getElementById("receiptDispAccount");
    this.receiptDispRef = document.getElementById("receiptDispRef");
    this.receiptDispTrace = document.getElementById("receiptDispTrace");
    this.receiptDispTime = document.getElementById("receiptDispTime");
    this.receiptDispPurpose = document.getElementById("receiptDispPurpose");
    this.btnPrintReceipt = document.getElementById("btnPrintReceipt");
    this.btnShareReceipt = document.getElementById("btnShareReceipt");
    this.btnCloseReceiptModal = document.getElementById("btnCloseReceiptModal");
  }

  // --- Event Handling ---
  bindEvents() {
    // Splash
    this.btnSkipSplash.addEventListener("click", () => this.finishSplash());

    // Top controls (only in dashboard)
    if (this.btnTopResetBalance) {
      this.btnTopResetBalance.addEventListener("click", () => {
        this.saveBalance(DEFAULT_BALANCE);
        this.notify("Balance reset to ₨ 500,000.00 (Hassan Khan)");
      });
    }

    if (this.btnCardRefill500k) {
      this.btnCardRefill500k.addEventListener("click", () => {
        this.saveBalance(DEFAULT_BALANCE);
        this.notify("Wallet replenished to ₨ 500,000.00");
      });
    }

    if (this.btnTopReplaySplash) {
      this.btnTopReplaySplash.addEventListener("click", () => {
        this.showScreen("splashScreen");
        this.startSplashIntro();
      });
    }

    if (this.btnTopLock) {
      this.btnTopLock.addEventListener("click", () => {
        this.enteredPin = "";
        this.updatePinDots();
        this.showScreen("lockScreen");
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
      this.notify("Activity feed restored to default");
    });

    // Modal Triggers
    this.btnTriggerSend.addEventListener("click", () => this.openModal(this.modalSendMoney));
    this.btnTriggerTopup.addEventListener("click", () => this.openModal(this.modalTopup));

    this.btnTriggerRequest.addEventListener("click", () => {
      this.notify("Payment link generated: tpay.me/hassan_khan");
    });

    this.btnTriggerBills.addEventListener("click", () => {
      this.notify("Bills Portal: LESCO, SNGPL, PTCL connected");
    });

    // Modal Close
    document.querySelectorAll("[data-dismiss]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-dismiss");
        this.closeModal(document.getElementById(targetId));
      });
    });

    // Quick Beneficiaries
    document.querySelectorAll("#contactsRow .quick-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const name = chip.getAttribute("data-name");
        const iban = chip.getAttribute("data-iban");
        this.sendRecipientAccount.value = `${name} (${iban})`;
      });
    });

    // Quick Send Amounts
    document.querySelectorAll("#modalSendMoney [data-amt]").forEach(chip => {
      chip.addEventListener("click", () => {
        this.sendAmountField.value = chip.getAttribute("data-amt");
      });
    });

    // Quick Topup Amounts
    document.querySelectorAll("#modalTopup [data-topupamt]").forEach(chip => {
      chip.addEventListener("click", () => {
        this.topupAmountInput.value = chip.getAttribute("data-topupamt");
      });
    });

    // Carrier selector
    this.carrierCards.forEach(card => {
      card.addEventListener("click", () => {
        this.carrierCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedCarrier = card.getAttribute("data-carrier");
      });
    });

    // Execute Send
    this.btnExecuteSend.addEventListener("click", () => this.processSendMoney());

    // Execute Topup
    this.btnExecuteTopup.addEventListener("click", () => this.processTopup());

    // Print Receipt
    this.btnPrintReceipt.addEventListener("click", () => {
      window.print();
    });

    if (this.btnShareReceipt) {
      this.btnShareReceipt.addEventListener("click", () => {
        const ref = this.receiptDispRef.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`TPay Transaction Advice Ref: ${ref}`);
        }
        this.notify(`Transaction advice ${ref} copied!`);
      });
    }

    this.btnCloseReceiptModal.addEventListener("click", () => {
      this.closeModal(this.modalOfficialReceipt);
    });
  }

  // --- Splash Engine ---
  startSplashIntro() {
    if (this.splashTimer) clearInterval(this.splashTimer);

    let progress = 0;
    const step = 50;
    this.splashFillBar.style.width = "0%";
    this.splashTimerLabel.textContent = "Initializing secure banking session... (5s)";

    this.splashTimer = setInterval(() => {
      progress += step;
      const pct = Math.min(100, (progress / this.splashDuration) * 100);
      this.splashFillBar.style.width = pct + "%";

      const remainingSecs = Math.max(0, Math.ceil((this.splashDuration - progress) / 1000));
      this.splashTimerLabel.textContent = `Initializing secure banking session... (${remainingSecs}s)`;

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
    [this.splashScreen, this.lockScreen, this.dashboardScreen].forEach(scr => {
      if (scr) scr.classList.remove("is-active-stage");
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
    this.notify("Incorrect Password! Enter '2009'");
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
    if (this.isBalanceHidden) {
      this.dashBalanceDisplay.textContent = "••••••••";
    } else {
      this.dashBalanceDisplay.textContent = this.formatCurrency(this.balance);
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
    const bank = this.sendDestinationBank.value;
    const recipient = this.sendRecipientAccount.value.trim();
    const amount = parseFloat(this.sendAmountField.value);
    const purpose = this.sendPurposeSelect.value;

    if (!recipient) {
      alert("Please specify a recipient name, IBAN, or mobile number.");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (amount > this.balance) {
      alert("Insufficient available balance in your wallet.");
      return;
    }

    this.btnExecuteSend.disabled = true;
    this.btnExecuteSend.innerHTML = `<span>Processing Interbank Transfer...</span>`;

    setTimeout(() => {
      this.btnExecuteSend.disabled = false;
      this.btnExecuteSend.innerHTML = `<span>Proceed & Send</span> <i data-lucide="arrow-right"></i>`;

      // Deduct balance
      const newBal = this.balance - amount;
      this.saveBalance(newBal);

      // Unique UTR Reference
      const refId = "TP-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
      const recipientName = recipient.includes("(") ? recipient.split("(")[0].trim() : recipient;

      // Add to feed
      const newTx = {
        id: refId,
        title: `Transfer to ${recipientName}`,
        type: "send",
        amount: `-${this.formatCurrency(amount)}`,
        date: "Just now",
        meta: `${bank} • ${purpose}`
      };
      this.transactions.unshift(newTx);
      this.saveTransactions();

      // Reset form
      this.sendRecipientAccount.value = "";
      this.sendAmountField.value = "";
      this.closeModal(this.modalSendMoney);

      // Extract clean name and account
      let cleanRecipient = recipient;
      let cleanAccount = "PK" + Math.floor(10 + Math.random() * 89) + " " + bank.slice(0, 4).toUpperCase() + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000);
      if (recipient.includes("(") && recipient.includes(")")) {
        cleanRecipient = recipient.split("(")[0].trim();
        cleanAccount = recipient.split("(")[1].replace(")", "").trim();
      }

      // Show Official Professional Receipt Advice
      this.showReceiptModal({
        amount: `₨ ${this.formatCurrency(amount)}`,
        rawAmount: amount,
        recipient: cleanRecipient,
        account: cleanAccount,
        bank: bank,
        ref: refId,
        trace: "RAAST-PK-" + Math.floor(10000000 + Math.random() * 90000000),
        purpose: purpose,
        time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " PKT"
      });
    }, 900);
  }

  // --- Mobile Top-up Flow ---
  processTopup() {
    const phone = this.topupPhoneNumber.value.trim();
    const amount = parseFloat(this.topupAmountInput.value);

    if (!phone) {
      alert("Please enter a valid mobile number.");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter recharge amount.");
      return;
    }
    if (amount > this.balance) {
      alert("Insufficient available balance.");
      return;
    }

    this.btnExecuteTopup.disabled = true;
    this.btnExecuteTopup.innerHTML = `<span>Recharging ${this.selectedCarrier}...</span>`;

    setTimeout(() => {
      this.btnExecuteTopup.disabled = false;
      this.btnExecuteTopup.innerHTML = `<span>Instant Recharge</span> <i data-lucide="zap"></i>`;

      const newBal = this.balance - amount;
      this.saveBalance(newBal);

      const refId = "TU-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
      const newTx = {
        id: refId,
        title: `${this.selectedCarrier} Mobile Top-Up`,
        type: "topup",
        amount: `-${this.formatCurrency(amount)}`,
        date: "Just now",
        meta: `${phone} • Fast Recharge`
      };
      this.transactions.unshift(newTx);
      this.saveTransactions();

      this.topupPhoneNumber.value = "";
      this.topupAmountInput.value = "";
      this.closeModal(this.modalTopup);

      this.showReceiptModal({
        amount: `₨ ${this.formatCurrency(amount)}`,
        rawAmount: amount,
        recipient: phone,
        account: phone + " (Prepaid SIM)",
        bank: `${this.selectedCarrier} Telecom Network`,
        ref: refId,
        trace: "1LINK-TEL-" + Math.floor(10000000 + Math.random() * 90000000),
        purpose: "Mobile Airtime / Bundle Recharge",
        time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " PKT"
      });
    }, 900);
  }

  // --- Amount to Words Converter ---
  amountToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convert(n) {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
      if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
      return n.toString() + ' ';
    }

    const intPart = Math.floor(num);
    const words = convert(intPart).trim();
    return words ? `PKR ${words} Only` : 'PKR Zero Only';
  }

  // --- Show Professional Receipt ---
  showReceiptModal(data) {
    this.receiptDispAmount.textContent = data.amount;
    if (this.receiptDispAmountWords) {
      this.receiptDispAmountWords.textContent = this.amountToWords(data.rawAmount || 0);
    }
    this.receiptDispRecipient.textContent = data.recipient;
    if (this.receiptDispAccount) {
      this.receiptDispAccount.textContent = data.account;
    }
    this.receiptDispBank.textContent = data.bank;
    this.receiptDispRef.textContent = data.ref;
    if (this.receiptDispTrace) {
      this.receiptDispTrace.textContent = data.trace;
    }
    this.receiptDispTime.textContent = data.time;
    this.receiptDispPurpose.textContent = data.purpose;

    this.openModal(this.modalOfficialReceipt);
  }

  // --- Modals Helper ---
  openModal(modal) {
    modal.classList.add("is-open");
  }

  closeModal(modal) {
    modal.classList.remove("is-open");
  }

  // --- Toast Notifications ---
  notify(msg) {
    let toast = document.getElementById("skyToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "skyToast";
      toast.style.position = "fixed";
      toast.style.bottom = "28px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.background = "#0284C7";
      toast.style.color = "#FFFFFF";
      toast.style.padding = "10px 24px";
      toast.style.borderRadius = "30px";
      toast.style.fontSize = "13px";
      toast.style.fontWeight = "700";
      toast.style.zIndex = "9999999";
      toast.style.boxShadow = "0 8px 24px rgba(2, 132, 199, 0.35)";
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
