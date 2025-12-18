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
          <div class="gift-card">
            <div class="vendor-info">
              <div class="vendor-logo">
                <div class="placeholder-logo">${gift.vendorName.charAt(0)}</div>
              </div>
              <h2 class="vendor-name">${gift.vendorName}</h2>
            </div>
            <h1 class="gift-amount">${gift.amount} kr</h1>
            ${gift.personalMessage ? `
              <div class="message-card">
                <p>${gift.personalMessage}</p>
                <span class="sender">- ${gift.senderName}</span>
              </div>
            ` : ''}
            <button class="cta-button" id="transfer-button">
              Hent gavekortet 🎁
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
    }

    this.state.step = 'revealed';
  }

  private handleTransfer(gift: Gift): void {
    // Update state
    this.state.step = 'transferred';

    // Show pickup code page
    this.showPickupCode(gift);
  }

  private showPickupCode(gift: Gift): void {
    // Generate a formatted pickup code for the POC
    const pickupCode = 'HRF-R4K-TUE';

    this.container.innerHTML = `
      <div class="pickup-code-container">
        <div class="pickup-header">
          <div class="success-icon">✓</div>
          <h1>Gavekortet er klart!</h1>
          <p class="subtitle">Bruk hentekoden nedenfor for å legge gavekortet i Mine Gavekort-appen</p>
        </div>

        <div class="pickup-code-card">
          <span class="code-label">Din hentekode</span>
          <div class="pickup-code">${pickupCode}</div>
          <button class="copy-button" id="copy-code">
            Kopier kode
          </button>
        </div>

        <div class="gift-summary">
          <div class="vendor-logo-small">
            <div class="placeholder-logo">${gift.vendorName.charAt(0)}</div>
          </div>
          <div class="summary-details">
            <span class="vendor">${gift.vendorName}</span>
            <span class="amount">${gift.amount} kr</span>
          </div>
        </div>

        <div class="instructions">
          <h3>Slik henter du gavekortet:</h3>
          <ol>
            <li>Last ned <strong>Mine Gavekort</strong>-appen</li>
            <li>Åpne appen og velg "Legg til gavekort"</li>
            <li>Skriv inn hentekoden: <strong>${pickupCode}</strong></li>
          </ol>
        </div>

        <div class="app-download">
          <a href="https://apps.apple.com/no/app/mine-gavekort/id1234567890" class="store-button" target="_blank">
            <span class="store-icon">🍎</span>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=no.minegavekort" class="store-button" target="_blank">
            <span class="store-icon">▶️</span>
            Google Play
          </a>
        </div>

        <div class="more-animations-section">
          <p class="more-animations-title">Se flere animasjoner</p>
          <div class="animation-buttons">
            <a href="/g/TEST1234" class="animation-btn">🎂 Bursdag</a>
            <a href="/g/TESTFAR" class="animation-btn">👔 Farsdag</a>
            <a href="/g/TESTBRYL" class="animation-btn">💍 Bryllup</a>
            <a href="/g/TESTBAL" class="animation-btn">🎈 Ballong</a>
            <a href="/g/TESTJUL" class="animation-btn">🎄 Jul</a>
          </div>
        </div>
      </div>
    `;

    // Add copy functionality
    document.getElementById('copy-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(pickupCode).then(() => {
        const btn = document.getElementById('copy-code');
        if (btn) {
          btn.textContent = 'Kopiert! ✓';
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