/**
 * TPay - Modern White & Sky Blue Fintech Portal
 * Strict Sequential Flow:
 * Phase 1: Pure Fullscreen Splash -> Phase 2: Fullscreen Password (2009) -> Phase 3: Dashboard & Account
 * User: Sufiyan Ali | PIN: 2009 | Balance: 500k
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
    this.currentSendStep = 1;

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
    const saved = localStorage.getItem("tpay_sufiyan_balance") || localStorage.getItem("tpay_hassan_balance");
    return saved !== null ? parseFloat(saved) : DEFAULT_BALANCE;
  }

  saveBalance(amt) {
    this.balance = amt;
    localStorage.setItem("tpay_sufiyan_balance", amt.toString());
    localStorage.setItem("tpay_sufiyan_last_cycle", Date.now().toString());
    this.updateBalanceDisplay();
  }

  check24hAutoReplenish() {
    const lastCycle = localStorage.getItem("tpay_sufiyan_last_cycle") || localStorage.getItem("tpay_hassan_last_cycle");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastCycle || (now - parseInt(lastCycle)) >= oneDay) {
      this.saveBalance(DEFAULT_BALANCE);
    }
  }

  loadTransactions() {
    const saved = localStorage.getItem("tpay_sufiyan_txs") || localStorage.getItem("tpay_hassan_txs");
    if (saved) {
      try {
        const txs = JSON.parse(saved);
        txs.forEach(t => {
          if (t.date === "Just now") {
            t.date = "Today, 6:53 PM";
          }
        });
        return txs;
      } catch (e) {
        return [...INITIAL_TRANSACTIONS];
      }
    }
    return [...INITIAL_TRANSACTIONS];
  }

  saveTransactions() {
    localStorage.setItem("tpay_sufiyan_txs", JSON.stringify(this.transactions));
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

    // Send Form & Multi-step Wizard Navigation
    this.btnBackFromSend = document.getElementById("btnBackFromSend");
    this.btnBackSendLabel = document.getElementById("btnBackSendLabel");
    this.sendStageTitle = document.getElementById("sendStageTitle");
    this.sendWizardTrack = document.getElementById("sendWizardTrack");
    this.sendAvailBalDisplay = document.getElementById("sendAvailBalDisplay");

    // Stepper indicators (4 steps)
    this.stepIndicators = [
      document.getElementById("stepIndicator1"),
      document.getElementById("stepIndicator2"),
      document.getElementById("stepIndicator3"),
      document.getElementById("stepIndicator4")
    ];
    this.stepConnectors = [
      document.getElementById("stepConnector1"),
      document.getElementById("stepConnector2"),
      document.getElementById("stepConnector3")
    ];

    // Slide 1 Controls (Amount)
    this.sendAmountField = document.getElementById("sendAmountField");
    this.btnStep1Next = document.getElementById("btnStep1Next");

    // Slide 2 Controls (Select Bank)
    this.step2AmountBadge = document.getElementById("step2AmountBadge");
    this.btnEditAmountFromStep2 = document.getElementById("btnEditAmountFromStep2");
    this.sendDestinationBank = document.getElementById("sendDestinationBank");
    this.quickBankBadges = document.querySelectorAll("#quickBankBadges .quick-chip");
    this.btnStep2Back = document.getElementById("btnStep2Back");
    this.btnStep2Next = document.getElementById("btnStep2Next");

    // Slide 3 Controls (Recipient Details)
    this.step3BankBadge = document.getElementById("step3BankBadge");
    this.step3AmountBadge = document.getElementById("step3AmountBadge");
    this.btnChangeBankFromStep3 = document.getElementById("btnChangeBankFromStep3");
    this.sendRecipientName = document.getElementById("sendRecipientName");
    this.sendRecipientAccount = document.getElementById("sendRecipientAccount");
    this.sendPurposeSelect = document.getElementById("sendPurposeSelect");
    this.btnStep3Back = document.getElementById("btnStep3Back");
    this.btnStep3Next = document.getElementById("btnStep3Next");

    // Slide 4 Controls (Review & Confirm)
    this.reviewDispAmount = document.getElementById("reviewDispAmount");
    this.reviewDispRecipient = document.getElementById("reviewDispRecipient");
    this.reviewDispAccount = document.getElementById("reviewDispAccount");
    this.reviewDispBank = document.getElementById("reviewDispBank");
    this.reviewDispPurpose = document.getElementById("reviewDispPurpose");
    this.reviewDispTotal = document.getElementById("reviewDispTotal");
    this.btnExecuteSend = document.getElementById("btnExecuteSend");
    this.btnStep4Back = document.getElementById("btnStep4Back");

    // Modals
    this.modalOfficialReceipt = document.getElementById("modalOfficialReceipt");

    // Ticket Receipt Elements (Raqmi style)
    this.receiptScreen = document.getElementById("receiptScreen");
    this.btnBackFromReceipt = document.getElementById("btnBackFromReceipt");
    this.receiptDispAmount = document.getElementById("receiptDispAmount");
    this.receiptDispTime = document.getElementById("receiptDispTime");
    this.receiptDispRecipient = document.getElementById("receiptDispRecipient");
    this.receiptDispAccount = document.getElementById("receiptDispAccount");
    this.receiptDispRef = document.getElementById("receiptDispRef");
    this.receiptDispChannel = document.getElementById("receiptDispChannel");
    this.receiptDispSender = document.getElementById("receiptDispSender");
    this.receiptDestIcon = document.getElementById("receiptDestIcon");
    this.btnShareReceipt = document.getElementById("btnShareReceipt");
    this.btnCloseReceiptModal = document.getElementById("btnCloseReceiptModal");

    // Top Push Notification
    this.mobilePushNotification = document.getElementById("mobilePushNotification");
    this.pushBodyMsg = document.getElementById("pushBodyMsg");
    this.pushTimeout = null;
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
        this.notify("Sufiyan Ali • Account PK92 TPAY 8822 2009");
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
        this.unlockAudio();
        const val = btn.getAttribute("data-val");
        this.inputPinDigit(val);
      });
    });

    this.btnDeletePin.addEventListener("click", () => this.deletePinDigit());
    this.btnBiometricAuth.addEventListener("click", () => {
      this.unlockAudio();
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
        this.notify("Payment link generated: tpay.me/sufiyan_ali");
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

    // Dropdown change syncs active badge
    if (this.sendDestinationBank) {
      this.sendDestinationBank.addEventListener("change", () => {
        const selectedBank = this.sendDestinationBank.value;
        document.querySelectorAll("#quickBankBadges .quick-chip").forEach(badge => {
          if (badge.getAttribute("data-quickbank") === selectedBank) {
            badge.classList.add("active");
          } else {
            badge.classList.remove("active");
          }
        });
      });
    }

    // Quick Beneficiaries
    document.querySelectorAll("#contactsRow .quick-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        this.unlockAudio();
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
          if (this.quickBankBadges) {
            this.quickBankBadges.forEach(b => {
              if (b.getAttribute("data-quickbank") === bank) {
                b.classList.add("active");
              } else {
                b.classList.remove("active");
              }
            });
          }
          if (this.step3BankBadge) {
            this.step3BankBadge.textContent = bank;
          }
        }
      });
    });

    // Quick Send Amounts (Slide 1)
    document.querySelectorAll("#sendQuickAmounts .quick-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        this.unlockAudio();
        document.querySelectorAll("#sendQuickAmounts .quick-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        if (this.sendAmountField) {
          this.sendAmountField.value = chip.getAttribute("data-amt");
        }
      });
    });

    if (this.sendAmountField) {
      this.sendAmountField.addEventListener("input", () => {
        const val = this.sendAmountField.value;
        document.querySelectorAll("#sendQuickAmounts .quick-chip").forEach(c => {
          if (c.getAttribute("data-amt") === val) {
            c.classList.add("active");
          } else {
            c.classList.remove("active");
          }
        });
      });
    }

    // Step 1 -> Step 2 (Amount -> Select Bank)
    if (this.btnStep1Next) {
      this.btnStep1Next.addEventListener("click", () => {
        this.unlockAudio();
        const amt = parseFloat(this.sendAmountField ? this.sendAmountField.value : "0");
        if (!amt || amt <= 0) {
          alert("Please enter a valid transfer amount.");
          if (this.sendAmountField) this.sendAmountField.focus();
          return;
        }
        if (amt > this.balance) {
          alert("Insufficient available balance. Your balance is PKR " + this.formatCurrency(this.balance));
          return;
        }
        this.goToStep(2);
      });
    }

    // Step 2 Controls (Select Bank)
    if (this.quickBankBadges) {
      this.quickBankBadges.forEach(chip => {
        chip.addEventListener("click", () => {
          this.unlockAudio();
          const selectedBank = chip.getAttribute("data-quickbank");
          if (selectedBank && this.sendDestinationBank) {
            this.sendDestinationBank.value = selectedBank;
          }
          this.quickBankBadges.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          if (this.step3BankBadge) {
            this.step3BankBadge.textContent = selectedBank;
          }
        });
      });
    }

    if (this.sendDestinationBank) {
      this.sendDestinationBank.addEventListener("change", () => {
        const currentBank = this.sendDestinationBank.value;
        if (this.quickBankBadges) {
          this.quickBankBadges.forEach(c => {
            if (c.getAttribute("data-quickbank") === currentBank) {
              c.classList.add("active");
            } else {
              c.classList.remove("active");
            }
          });
        }
        if (this.step3BankBadge) {
          this.step3BankBadge.textContent = currentBank;
        }
      });
    }

    if (this.btnStep2Back) {
      this.btnStep2Back.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(1);
      });
    }
    if (this.btnEditAmountFromStep2) {
      this.btnEditAmountFromStep2.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(1);
      });
    }

    // Step 2 -> Step 3 (Select Bank -> Recipient Details)
    if (this.btnStep2Next) {
      this.btnStep2Next.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(3);
      });
    }

    // Step 3 Controls (Recipient Details)
    if (this.btnStep3Back) {
      this.btnStep3Back.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(2);
      });
    }
    if (this.btnChangeBankFromStep3) {
      this.btnChangeBankFromStep3.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(2);
      });
    }

    // Step 3 -> Step 4 (Recipient Details -> Confirm & Pay)
    if (this.btnStep3Next) {
      this.btnStep3Next.addEventListener("click", () => {
        this.unlockAudio();
        const recipientName = (this.sendRecipientName ? this.sendRecipientName.value.trim() : "");
        const recipientAccount = (this.sendRecipientAccount ? this.sendRecipientAccount.value.trim() : "");

        if (!recipientName) {
          alert("Please enter the Beneficiary / Receiver Full Name.");
          if (this.sendRecipientName) this.sendRecipientName.focus();
          return;
        }
        if (!recipientAccount) {
          alert("Please enter recipient account number or mobile wallet.");
          if (this.sendRecipientAccount) this.sendRecipientAccount.focus();
          return;
        }
        this.goToStep(4);
      });
    }

    // Step 4 Controls (Review & Confirm)
    if (this.btnStep4Back) {
      this.btnStep4Back.addEventListener("click", () => {
        this.unlockAudio();
        this.goToStep(3);
      });
    }

    // Execute Send on Step 4
    if (this.btnExecuteSend) {
      this.btnExecuteSend.addEventListener("click", () => {
        this.unlockAudio();
        this.processSendMoney();
      });
    }

    // Header Back button dynamically navigates 4 steps
    if (this.btnBackFromSend) {
      this.btnBackFromSend.addEventListener("click", () => {
        this.unlockAudio();
        if (this.currentSendStep === 1) {
          this.showScreen("dashboardScreen");
        } else if (this.currentSendStep === 2) {
          this.goToStep(1);
        } else if (this.currentSendStep === 3) {
          this.goToStep(2);
        } else if (this.currentSendStep === 4) {
          this.goToStep(3);
        }
      });
    }

    // Share / Copy Receipt Action
    if (this.btnShareReceipt) {
      this.btnShareReceipt.addEventListener("click", () => {
        this.unlockAudio();
        this.shareReceipt();
      });
    }

    // Return to Dashboard from Receipt
    if (this.btnCloseReceiptModal) {
      this.btnCloseReceiptModal.addEventListener("click", () => {
        this.showScreen("dashboardScreen");
      });
    }
    if (this.btnBackFromReceipt) {
      this.btnBackFromReceipt.addEventListener("click", () => {
        this.showScreen("dashboardScreen");
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

  // --- Multi-Step Send Money Wizard Engine ---
  goToStep(step) {
    this.currentSendStep = step;
    if (this.sendWizardTrack) {
      this.sendWizardTrack.style.transform = `translateX(-${(step - 1) * 100}%)`;
    }

    // Update Stepper Visuals
    if (this.stepIndicators) {
      this.stepIndicators.forEach((ind, idx) => {
        if (!ind) return;
        const circle = ind.querySelector(".step-num-circle");
        ind.classList.remove("active", "completed");
        if (idx + 1 < step) {
          ind.classList.add("completed");
          if (circle) circle.textContent = "✓";
        } else if (idx + 1 === step) {
          ind.classList.add("active");
          if (circle) circle.textContent = (idx + 1).toString();
        } else {
          if (circle) circle.textContent = (idx + 1).toString();
        }
      });
    }

    if (this.stepConnectors) {
      this.stepConnectors.forEach((conn, idx) => {
        if (!conn) return;
        if (step > idx + 1) {
          conn.classList.add("active");
        } else {
          conn.classList.remove("active");
        }
      });
    }

    // Header Back button and Title
    if (this.btnBackSendLabel) {
      if (step === 1) this.btnBackSendLabel.textContent = "Dashboard";
      else if (step === 2) this.btnBackSendLabel.textContent = "Amount";
      else if (step === 3) this.btnBackSendLabel.textContent = "Bank";
      else if (step === 4) this.btnBackSendLabel.textContent = "Details";
    }

    if (this.sendStageTitle) {
      if (step === 1) this.sendStageTitle.textContent = "Send Money";
      else if (step === 2) this.sendStageTitle.textContent = "Select Bank";
      else if (step === 3) this.sendStageTitle.textContent = "Recipient Details";
      else if (step === 4) this.sendStageTitle.textContent = "Confirm Transfer";
    }

    const amt = parseFloat(this.sendAmountField ? this.sendAmountField.value : "0") || 0;
    const bank = (this.sendDestinationBank ? this.sendDestinationBank.value : "Easypaisa");

    if (step === 2) {
      if (this.step2AmountBadge) {
        this.step2AmountBadge.textContent = `₨ ${this.formatCurrency(amt)}`;
      }
    }

    if (step === 3) {
      if (this.step3AmountBadge) {
        this.step3AmountBadge.textContent = `₨ ${this.formatCurrency(amt)}`;
      }
      if (this.step3BankBadge) {
        this.step3BankBadge.textContent = bank;
      }
    }

    if (step === 4) {
      const recipientName = (this.sendRecipientName ? this.sendRecipientName.value.trim() : "") || "TEMOOR SHAH";
      const recipientAccount = (this.sendRecipientAccount ? this.sendRecipientAccount.value.trim() : "") || "0300-8822054";
      const purpose = (this.sendPurposeSelect ? this.sendPurposeSelect.value : "Family / Personal Transfer");

      if (this.reviewDispAmount) this.reviewDispAmount.textContent = `₨ ${this.formatCurrency(amt)}`;
      if (this.reviewDispRecipient) this.reviewDispRecipient.textContent = recipientName.toUpperCase();
      if (this.reviewDispAccount) this.reviewDispAccount.textContent = recipientAccount;
      if (this.reviewDispBank) this.reviewDispBank.textContent = bank;
      if (this.reviewDispPurpose) this.reviewDispPurpose.textContent = purpose;
      if (this.reviewDispTotal) this.reviewDispTotal.textContent = `₨ ${this.formatCurrency(amt)}`;
    }

    // Scroll container to top
    if (this.sendScreen) this.sendScreen.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Strict Stage Switcher ---
  showScreen(screenId) {
    document.querySelectorAll(".stage-screen").forEach(scr => {
      scr.classList.remove("is-active-stage");
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("is-active-stage");
      target.scrollTop = 0;
    }

    if (screenId === "sendScreen") {
      if (this.sendAvailBalDisplay) {
        this.sendAvailBalDisplay.textContent = this.formatCurrency(this.balance);
      }
      this.goToStep(1);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    if (document.body) document.body.scrollTop = 0;
    if (document.documentElement) document.documentElement.scrollTop = 0;

    if (window.lucide) {
      lucide.createIcons();
    }
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
      this.notify("Welcome back, Sufiyan Ali");
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

      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        const cleanAmt = tx.amount.replace('-', '').replace('+', '').trim();
        const partyName = tx.title.replace('Transfer to ', '').replace('Received from ', '');
        this.showReceiptModal({
          amountStr: `Rs. ${cleanAmt.replace('.00', '')}`,
          timestamp: tx.date,
          recipient: partyName.toUpperCase(),
          accountMask: "*2009",
          bank: tx.meta.split('•')[0].trim(),
          ref: tx.id,
          channel: "Raast"
        });
      });

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
        this.btnExecuteSend.innerHTML = `<i data-lucide="send" style="width: 18px; height: 18px;"></i> <span>Send Payment Now</span>`;
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
      const txDisplayDate = `Today, ${hours}:${minutes} ${ampm}`;

      // Add to transaction feed
      const newTx = {
        id: refId,
        title: `Transfer to ${recipientName.toUpperCase()}`,
        type: "send",
        amount: `-${this.formatCurrency(amount)}`,
        date: txDisplayDate,
        meta: `${bank} • Raast Instant`
      };
      this.transactions.unshift(newTx);
      this.saveTransactions();

      // Clear input fields
      if (this.sendRecipientName) this.sendRecipientName.value = "";
      if (this.sendRecipientAccount) this.sendRecipientAccount.value = "";
      if (this.sendAmountField) this.sendAmountField.value = "";
      document.querySelectorAll("#sendQuickAmounts .quick-chip").forEach(c => c.classList.remove("active"));

      // Reset wizard back to Step 1 for next time
      this.goToStep(1);

      // Play authentic banking bell / ring chime & trigger mobile vibration
      this.playSuccessChime();

      // Show top push notification banner
      this.showPushNotification(`₨ ${this.formatCurrency(amount).replace('.00', '')} successfully sent to ${recipientName.toUpperCase()} via Raast!`);

      // Switch directly to receipt voucher screen!
      this.showReceiptModal({
        amountStr: `Rs. ${this.formatCurrency(amount).replace('.00', '')}`,
        timestamp: formattedTimestamp,
        recipient: recipientName.toUpperCase(),
        accountMask: last4,
        bank: bank,
        ref: refId,
        channel: "Raast"
      });
    }, 750);
  }

  // --- Mobile Audio Unlocker (Direct User Gesture) ---
  unlockAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      // Prime mobile audio session with a micro silent tick
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(0);
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio unlock error:", e);
    }
  }

  // --- Banking Ring / Bell Chime Sound + Haptic Vibration ---
  playSuccessChime() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Helper to synthesize physical bell harmonics
      const playBellNote = (freq, startTime, duration, volume) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // 4-note melodic crystal fintech payment chime (Ding-dong-ring)
      playBellNote(659.25, now, 0.45, 0.35);           // Note 1: E5
      playBellNote(830.61, now + 0.12, 0.55, 0.38);     // Note 2: G#5
      playBellNote(1046.50, now + 0.24, 0.90, 0.45);    // Note 3: C6
      playBellNote(1318.51, now + 0.26, 0.95, 0.30);    // Harmonic: E6

      // Mobile phone vibration ring pattern (140ms buzz, 60ms pause, 200ms buzz)
      if (navigator.vibrate) {
        try {
          navigator.vibrate([140, 60, 200]);
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  }

  // --- Real-time Mobile Push Notification Banner ---
  showPushNotification(msg) {
    if (!this.mobilePushNotification) {
      this.mobilePushNotification = document.getElementById("mobilePushNotification");
    }
    if (!this.pushBodyMsg) {
      this.pushBodyMsg = document.getElementById("pushBodyMsg");
    }

    if (this.pushBodyMsg) {
      this.pushBodyMsg.textContent = msg;
    }

    if (this.mobilePushNotification) {
      if (this.pushTimeout) clearTimeout(this.pushTimeout);
      this.mobilePushNotification.classList.remove("is-visible");
      // Force layout reflow so animation re-triggers
      void this.mobilePushNotification.offsetWidth;
      this.mobilePushNotification.classList.add("is-visible");

      // Also trigger native browser Notification if permitted
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification("TPay • Instant Transfer", {
              body: msg,
              icon: "tpay_logo.png"
            });
          } catch (e) {}
        } else if (Notification.permission !== "denied") {
          try {
            Notification.requestPermission().then(perm => {
              if (perm === "granted") {
                new Notification("TPay • Instant Transfer", {
                  body: msg,
                  icon: "tpay_logo.png"
                });
              }
            });
          } catch (e) {}
        }
      }

      this.pushTimeout = setTimeout(() => {
        if (this.mobilePushNotification) {
          this.mobilePushNotification.classList.remove("is-visible");
        }
      }, 6500);
    }
  }

  // --- Bank / Wallet SVG Emblem Generator ---
  getBankIconHtml(bankName) {
    const bank = (bankName || "").toLowerCase();
    if (bank.includes("easypaisa")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#00A651"/>
        <path d="M14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C17.5 22 20.5 19.7 21.5 16.5H16.8C16.1 17.6 15.1 18.3 14 18.3C11.6 18.3 9.7 16.4 9.7 14C9.7 11.6 11.6 9.7 14 9.7C15.6 9.7 17 10.6 17.7 11.9H21.8C20.8 8.5 17.7 6 14 6Z" fill="#FFFFFF"/>
        <circle cx="14" cy="14" r="2.8" fill="#0F172A"/>
      </svg>`;
    } else if (bank.includes("jazzcash") || bank.includes("mobilink")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#ED1C24"/>
        <path d="M16 8H12V17C12 18.7 10.7 20 9 20C7.3 20 6 18.7 6 17H8.5C8.5 17.3 8.7 17.5 9 17.5C9.3 17.5 9.5 17.3 9.5 17V8H8V5.5H16V8Z" fill="#FFFFFF"/>
        <circle cx="19" cy="9" r="2.2" fill="#FFC800"/>
      </svg>`;
    } else if (bank.includes("sada")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#14B8A6"/>
        <circle cx="11.5" cy="14" r="5" fill="#FFFFFF" fill-opacity="0.85"/>
        <circle cx="16.5" cy="14" r="5" fill="#FF7043" fill-opacity="0.9"/>
      </svg>`;
    } else if (bank.includes("naya")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#F97316"/>
        <path d="M9 8H11.5L16.5 16.5V8H19V20H16.5L11.5 11.5V20H9V8Z" fill="#FFFFFF"/>
      </svg>`;
    } else if (bank.includes("raqmi") || bank.includes("raqami")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#EDE9FE"/>
        <rect x="7" y="7" width="14" height="14" rx="1" transform="rotate(0 14 14)" stroke="#6366F1" stroke-width="1.6"/>
        <rect x="7" y="7" width="14" height="14" rx="1" transform="rotate(45 14 14)" stroke="#6366F1" stroke-width="1.6"/>
        <circle cx="14" cy="14" r="2" fill="#6366F1"/>
      </svg>`;
    } else if (bank.includes("meezan")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#1E3A8A"/>
        <path d="M14 6L21 11V13H7V11L14 6ZM9 14H11V19H9V14ZM13 14H15V19H13V14ZM17 14H19V19H17V14ZM7 20H21V22H7V20Z" fill="#FFFFFF"/>
      </svg>`;
    } else if (bank.includes("habib") || bank.includes("hbl")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#047857"/>
        <path d="M14 6L21 11V13H7V11L14 6ZM9 14H11V19H9V14ZM13 14H15V19H13V14ZM17 14H19V19H17V14ZM7 20H21V22H7V20Z" fill="#FFFFFF"/>
      </svg>`;
    } else if (bank.includes("alfalah")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#DC2626"/>
        <path d="M14 6L21 11V13H7V11L14 6ZM9 14H11V19H9V14ZM13 14H15V19H13V14ZM17 14H19V19H17V14ZM7 20H21V22H7V20Z" fill="#FFFFFF"/>
      </svg>`;
    } else if (bank.includes("payvay") || bank.includes("payway")) {
      return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#4F46E5"/>
        <path d="M8.5 10L14 20L19.5 10H16.5L14 15.5L11.5 10H8.5Z" fill="#FFFFFF"/>
        <circle cx="14" cy="9" r="2.2" fill="#38BDF8"/>
      </svg>`;
    }
    return `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="#0284C7"/>
      <path d="M14 6L21 11V13H7V11L14 6ZM9 14H11V19H9V14ZM13 14H15V19H13V14ZM17 14H19V19H17V14ZM7 20H21V22H7V20Z" fill="#FFFFFF"/>
    </svg>`;
  }

  // --- Show Exact Ticket Receipt ---
  showReceiptModal(data) {
    if (this.receiptDispAmount) this.receiptDispAmount.textContent = data.amountStr;
    if (this.receiptDispTime) this.receiptDispTime.textContent = data.timestamp;
    if (this.receiptDispRecipient) this.receiptDispRecipient.textContent = data.recipient;
    if (this.receiptDispAccount) this.receiptDispAccount.textContent = data.accountMask;
    if (this.receiptDispRef) this.receiptDispRef.textContent = data.ref;
    if (this.receiptDispChannel) this.receiptDispChannel.textContent = data.channel;
    if (this.receiptDispSender) this.receiptDispSender.textContent = "Sufiyan Ali";
    if (this.receiptDestIcon) {
      this.receiptDestIcon.innerHTML = this.getBankIconHtml(data.bank);
    }

    // Switch stage screen directly so it is 100% visible and centered on mobile
    this.showScreen("receiptScreen");

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Share / Copy Receipt ---
  shareReceipt() {
    const amt = this.receiptDispAmount ? this.receiptDispAmount.textContent : "Rs. 260";
    const toName = this.receiptDispRecipient ? this.receiptDispRecipient.textContent : "Beneficiary";
    const toAcct = this.receiptDispAccount ? this.receiptDispAccount.textContent : "";
    const ref = this.receiptDispRef ? this.receiptDispRef.textContent : "";
    const time = this.receiptDispTime ? this.receiptDispTime.textContent : "";
    const sender = this.receiptDispSender ? this.receiptDispSender.textContent : "Sufiyan Ali";

    const shareData = {
      title: "TPay Raast Payment Receipt",
      text: `✅ Payment of ${amt} successfully sent to ${toName} (${toAcct}) via Raast Instant.\nSender: ${sender}\nTransaction ID: ${ref}\n${time}\nProcessed Securely By Raqami Islamic Digital Bank.`
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareData.text).then(() => {
              this.notify("Receipt details copied to clipboard!");
            });
          }
        }
      });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareData.text).then(() => {
        this.notify("Receipt details copied to clipboard!");
      }).catch(() => {
        window.print();
      });
    } else {
      window.print();
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
