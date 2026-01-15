import './ui/styles/main.scss';
import { Router } from './router';
import { GiftRevealController } from './controllers/GiftRevealController';
import { createGiftService } from './core/services/gift.service';
import { config } from './config/app.config';

class App {
  private router: Router;
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById('app')!;
    this.router = new Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Gift reveal route: /g/{code} - supports codes between 4-12 characters
    this.router.register(/^\/g\/([a-zA-Z0-9]{4,12})$/, async (match: RegExpMatchArray) => {
      const code = match[1];

      const controller = new GiftRevealController(
        this.container,
        createGiftService(config.USE_MOCKS)
      );
      await controller.initialize(code);
    });

    // Default/home route - match / or empty
    this.router.register(/^\/?$/, () => {
      this.showHomepage();
    });

    // Catch-all route for invalid paths
    this.router.register(/^.*$/, () => {
      this.showError('Ugyldig gave-link');
    });
  }

  private showHomepage(): void {
    // Get current date for the iMessage timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

    this.container.innerHTML = `
      <div class="imessage-screen">
        <div class="imessage-app">
          <div class="imessage-header">
            <span class="back-button">‹</span>
            <div class="contact-avatar">🎁</div>
            <div class="contact-info">
              <div class="contact-name">GAVEKORT</div>
              <div class="contact-status">iMessage</div>
            </div>
            <div class="header-icons">
              <span class="header-icon">📹</span>
              <span class="header-icon">📞</span>
            </div>
          </div>

          <div class="imessage-chat">
            <div class="imessage-date">${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} ${timeStr}</div>

            <div class="imessage-bubble received">
              Hei Ola Halvorsen! Kari Nordmann har sendt deg et gavekort fra Scala Kjøpesentre.<br><br>Se gaven din her: <a href="/g/TEST1234" class="imessage-link">minegavekort.app/g/TEST1234</a><br><br>Hilsen oss i Scala Kjøpesentre
            </div>

            <a href="/g/TEST1234" class="imessage-link-preview" id="gift-link">
              <div class="link-preview-image">
                <span class="preview-gift-icon">🎁</span>
              </div>
              <div class="link-preview-content">
                <div class="link-preview-domain">minegavekort.app</div>
                <div class="link-preview-title">Du har fått et gavekort!</div>
                <div class="link-preview-description">Trykk for å åpne gaven din</div>
              </div>
            </a>
          </div>

          <div class="imessage-input-bar">
            <button class="input-button">+</button>
            <input type="text" class="message-input" placeholder="iMessage" disabled>
            <button class="input-button">🎤</button>
          </div>
        </div>
      </div>
    `;
  }

  private showError(message: string): void {
    this.container.innerHTML = `
      <div class="status-container error-state">
        <div class="status-icon">😕</div>
        <h1>Oops!</h1>
        <p>${message}</p>
        <a href="/" class="cta-button">Tilbake til forsiden</a>
      </div>
    `;
  }

  public start(): void {
    // Parse URL and navigate
    const path = window.location.pathname;
    this.router.navigate(path);

    // Handle browser navigation
    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname;
      this.router.navigate(newPath);
    });

    // Handle link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.hostname === window.location.hostname) {
        e.preventDefault();
        const path = link.pathname + link.search; // Include query parameters
        window.history.pushState({}, '', path);
        this.router.navigate(link.pathname);
      }
    });
  }
}

// Start application
const app = new App();
app.start();