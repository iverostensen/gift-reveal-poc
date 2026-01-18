import { Gift, RevealState } from '../core/models/gift.model';
import { IGiftService } from '../core/services/gift.service';
import { AnimationFactory, IGiftAnimation, ConfettiEffect, SnowflakeEffect } from '../ui/animations';

export class GiftRevealController {
  private state: RevealState = {
    step: 'loading',
    tapsRemaining: 1,
    animationProgress: 0
  };
  private animation: IGiftAnimation | null = null;
  private currentGift: Gift | null = null;

  constructor(
    private container: HTMLElement,
    private giftService: IGiftService
  ) {}

  async initialize(code: string): Promise<void> {
    try {
      // 1. Load gift data
      const gift = await this.giftService.getGift(code);

      // 2. Check if already activated
      if (gift.isActivated) {
        this.showAlreadyActivated(gift);
        return;
      }

      // 3. Render gift box
      await this.renderGiftBox(gift);

      // 4. Mark as opened
      if (!gift.isOpened) {
        await this.giftService.markAsOpened(code);
      }

      // 5. Setup interactions
      this.setupInteractions(gift);

    } catch (error: any) {
      this.showError(error.message);
    }
  }

  private async renderGiftBox(gift: Gift): Promise<void> {
    this.currentGift = gift; // Store gift for later use
    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="gift-reveal-container">
          <div class="gift-header">
            <p class="sender-text">Fra ${gift.senderName}</p>
          </div>

          <div class="gift-box-wrapper">
            <div id="animation-container"></div>
            <div class="tap-indicator visible">
              <span class="tap-count">${this.state.tapsRemaining}</span>
              <span class="tap-text">trykk for å åpne</span>
            </div>
          </div>

          <div class="gift-content hidden" id="gift-content">
            <div class="reveal-hero">
              <div class="reveal-logo animate-in">
                ${gift.vendorLogoUrl && !gift.vendorLogoUrl.includes('placeholder')
                  ? `<img src="${gift.vendorLogoUrl}" alt="${gift.vendorName}" class="reveal-logo-img">`
                  : `<div class="reveal-logo-placeholder">${gift.vendorName.charAt(0)}</div>`
                }
              </div>
              <h1 class="reveal-amount animate-in"><span id="amount-counter">0</span> kr</h1>
            </div>

            ${gift.personalMessage ? `
              <div class="message-card-reveal animate-in-delayed">
                <p class="message-text">${gift.personalMessage}</p>
                <span class="message-sender">— ${gift.senderName}</span>
              </div>
            ` : ''}

            <button class="cta-button reveal-cta animate-in" id="transfer-button">
              Hent gavekortet
            </button>
          </div>
        </div>
      </div>
    `;

    // Create animation using factory based on gift type
    this.animation = AnimationFactory.create(gift.animationType as any);
    console.log(`Using ${gift.animationType} animation theme`);

    await this.animation.load(
      document.getElementById('animation-container')!
    );

    // Start idle animation to invite interaction
    this.animation.playIdle();

    this.state.step = 'ready';
  }

  private setupInteractions(gift: Gift): void {
    const container = document.querySelector('.gift-box-wrapper') as HTMLElement;

    container?.addEventListener('click', async () => {
      if (this.state.tapsRemaining > 0) {
        await this.handleTap();
      }
    });

    // Transfer button
    document.getElementById('transfer-button')?.addEventListener('click', () => {
      this.handleTransfer(gift);
    });
  }

  private async handleTap(): Promise<void> {
    this.state.tapsRemaining--;

    // Play animation segment
    if (!this.animation) return;

    if (this.state.tapsRemaining === 0) {
      // Single tap - Full reveal sequence
      this.state.step = 'revealed';

      // Start reveal animation and trigger confetti at the right moment
      this.triggerSynchronizedReveal();
    }
  }

  private async triggerSynchronizedReveal(): Promise<void> {
    if (!this.animation) return;

    // Hide tap indicator immediately
    const indicator = document.querySelector('.tap-indicator');
    if (indicator) {
      indicator.classList.remove('visible');
    }

    // Start the reveal animation sequence
    const revealPromise = this.animation.playReveal();

    // Trigger confetti/snowflakes when lid flies off: ~900ms
    setTimeout(() => {
      if (this.currentGift?.animationType === 'christmas') {
        // Use canvas snowflakes for Christmas theme
        const snowflakes = new SnowflakeEffect();
        snowflakes.winterMagic(); // Gold stars + white snowflakes
      } else {
        // Use regular confetti for other themes
        const confetti = new ConfettiEffect();
        confetti.burst();
      }
    }, 900);

    // Gift content fades in after box animation: ~1300ms
    setTimeout(() => {
      this.showGiftContent();
    }, 1300);

    // Wait for animation to complete
    await revealPromise;
  }

  private showGiftContent(): void {
    // Hide gift header
    const giftHeader = document.querySelector('.gift-header') as HTMLElement;
    if (giftHeader) {
      giftHeader.style.transition = 'opacity 0.3s ease';
      giftHeader.style.opacity = '0';
      setTimeout(() => {
        giftHeader.style.display = 'none';
      }, 300);
    }

    // Gift box wrapper fades out subtilt
    const giftBoxWrapper = document.querySelector('.gift-box-wrapper') as HTMLElement;
    if (giftBoxWrapper) {
      giftBoxWrapper.style.transition = 'opacity 0.4s ease';
      giftBoxWrapper.style.opacity = '0';

      // Hide after fade
      setTimeout(() => {
        giftBoxWrapper.style.display = 'none';
      }, 400);
    }

    // Show content with simple fade-in immediately
    const content = document.getElementById('gift-content');
    if (content) {
      content.classList.remove('hidden');
      content.style.opacity = '0';
      content.style.transition = 'opacity 0.6s ease';

      // Trigger fade in animation - very short delay for smooth transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          content.style.opacity = '1';
        });
      });

      // Start count-up animation for amount
      this.animateAmountCounter();
    }

    this.state.step = 'revealed';
  }

  private animateAmountCounter(): void {
    const counter = document.getElementById('amount-counter');
    if (!counter || !this.currentGift) return;

    const targetAmount = this.currentGift.amount;
    const duration = 1400; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(easeOut * targetAmount);

      counter.textContent = currentValue.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation after a small delay
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 200);
  }

  private handleTransfer(gift: Gift): void {
    // Update state
    this.state.step = 'transferred';

    // Animate out current content, then show pickup page
    const phoneFrame = this.container.querySelector('.phone-frame') as HTMLElement;
    if (phoneFrame) {
      phoneFrame.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      phoneFrame.style.opacity = '0';
      phoneFrame.style.transform = 'scale(0.98)';

      setTimeout(() => {
        this.showPickupCode(gift);
      }, 300);
    } else {
      this.showPickupCode(gift);
    }
  }

  private showPickupCode(gift: Gift): void {
    // Generate a formatted pickup code for the POC
    const pickupCode = 'HRF-R4K-TUE';

    this.container.innerHTML = `
      <div class="phone-frame">
        <div class="pickup-page">
          <div class="pickup-header">
            <div class="pickup-gift-summary">
              ${gift.vendorLogoUrl && !gift.vendorLogoUrl.includes('placeholder')
                ? `<img src="${gift.vendorLogoUrl}" alt="${gift.vendorName}" class="pickup-vendor-logo">`
                : `<span class="pickup-vendor-name">${gift.vendorName}</span>`
              }
              <span class="pickup-amount">${gift.amount} kr</span>
            </div>
          </div>

          <div class="pickup-instructions">
            <h1 class="pickup-title">Hent gavekortet ditt</h1>
            <p class="pickup-subtitle">Bruk koden under i Mine Gavekort-appen</p>

            <div class="pickup-code-display">
              <span class="code-text">${pickupCode}</span>
            </div>
            <button class="code-copy-btn" id="copy-code">Kopier kode</button>

            <div class="pickup-steps">
              <div class="pickup-step">
                <span class="step-number">1</span>
                <span class="step-text">Last ned Mine Gavekort-appen</span>
              </div>
              <div class="pickup-step">
                <span class="step-number">2</span>
                <span class="step-text">Skriv inn koden i appen</span>
              </div>
              <div class="pickup-step">
                <span class="step-number">3</span>
                <span class="step-text">Følg instruksjonene for å legge til i lommeboken</span>
              </div>
            </div>
          </div>

          <div class="pickup-actions">
            <a href="minegavekort://redeem?code=${pickupCode}" class="pickup-primary-btn">
              Åpne Mine Gavekort
            </a>
          </div>

          <div class="pickup-demo-links">
            <span class="demo-label">Demo:</span>
            <a href="/g/TEST1234">🎂</a>
            <a href="/g/TESTFAR">👔</a>
            <a href="/g/TESTBRYL">💍</a>
            <a href="/g/TESTBAL">🎈</a>
            <a href="/g/TESTJUL">🎄</a>
          </div>
        </div>
      </div>
    `;

    // Animate in the new page
    const phoneFrame = this.container.querySelector('.phone-frame') as HTMLElement;
    if (phoneFrame) {
      phoneFrame.style.opacity = '0';
      phoneFrame.style.transform = 'scale(0.98)';
      requestAnimationFrame(() => {
        phoneFrame.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        phoneFrame.style.opacity = '1';
        phoneFrame.style.transform = 'scale(1)';
      });
    }

    // Add copy functionality
    document.getElementById('copy-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(pickupCode).then(() => {
        const btn = document.getElementById('copy-code');
        if (btn) {
          btn.textContent = 'Kopiert!';
          setTimeout(() => {
            btn.textContent = 'Kopier kode';
          }, 2000);
        }
      });
    });
  }

  private showAlreadyActivated(gift: Gift): void {
    this.container.innerHTML = `
      <div class="status-container already-activated">
        <div class="status-icon">✅</div>
        <h1>Gavekortet er allerede hentet</h1>
        <p>Dette gavekortet på <strong>${gift.amount} kr</strong> til <strong>${gift.vendorName}</strong>
           er allerede lagt til i Mine Gavekort-appen.</p>
        <button class="cta-button" onclick="alert('Ville åpnet Mine Gavekort-appen')">
          Åpne Mine Gavekort
        </button>
      </div>
    `;
  }

  private showError(message: string): void {
    this.container.innerHTML = `
      <div class="status-container error-state">
        <div class="status-icon">😕</div>
        <h1>Noe gikk galt</h1>
        <p>${message}</p>
        <button class="cta-button" onclick="window.location.reload()">
          Prøv igjen
        </button>
      </div>
    `;
  }
}