/**
 * YourBrand Sports Betting Loader
 * Injected into rented sports-book UI to add your functionality
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = window.YOURBRAND || {};
    const API_BASE = CONFIG.apiUrl || 'https://api.yourbrand.com';
    const BOT_USERNAME = CONFIG.botUsername || '@YourBrandBot';
    const TELEGRAM_BOT = CONFIG.telegramBot || 'https://t.me/YourBrandBot';

    // DOM ready
    function init() {
        console.log('🎰 YourBrand loader initialized');

        // Override login functionality
        overrideLogin();

        // Add your branding
        injectBranding();

        // Add Telegram login
        addTelegramLogin();

        // Monitor bet placement
        monitorBets();

        // Add customer context
        addCustomerContext();
    }

    // Override the renter's login system
    function overrideLogin() {
        // Hide password-based login
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => field.style.display = 'none');

        // Hide username fields that aren't ours
        const usernameFields = document.querySelectorAll('input[name*="user"], input[name*="email"], input[placeholder*="user"]');
        usernameFields.forEach(field => {
            if (!field.classList.contains('yourbrand-identity')) {
                field.style.display = 'none';
            }
        });

        // Override login forms
        const loginForms = document.querySelectorAll('form[action*="login"], form[id*="login"]');
        loginForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                redirectToTelegram();
            });
        });
    }

    // Add Telegram login button
    function addTelegramLogin() {
        const loginButtons = document.querySelectorAll('button[id*="login"], a[href*="login"], .login-button');

        loginButtons.forEach(button => {
            const tgButton = document.createElement('button');
            tgButton.className = 'yourbrand-tg-login';
            tgButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Login with Telegram
            `;

            tgButton.onclick = redirectToTelegram;
            button.parentNode.replaceChild(tgButton, button);
        });
    }

    // Redirect to Telegram bot
    function redirectToTelegram() {
        const customerId = CONFIG.customerId || 'anonymous';
        const startParam = `login_${customerId}_${Date.now()}`;

        // Deep link to bot
        const botUrl = `${TELEGRAM_BOT}?start=${startParam}`;
        window.location.href = botUrl;
    }

    // Inject your branding
    function injectBranding() {
        // Add your CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/_yourbrand/branding.css';
        document.head.appendChild(link);

        // Replace logo
        const logos = document.querySelectorAll('img[src*="logo"], .logo, [class*="logo"]');
        logos.forEach(logo => {
            logo.src = '/_yourbrand/logo.png';
            logo.alt = 'YourBrand Sports Betting';
        });

        // Update page title
        document.title = document.title.replace(/fantasy402|Fantasy 402/gi, 'YourBrand');

        // Add your footer
        const footer = document.createElement('div');
        footer.className = 'yourbrand-footer';
        footer.innerHTML = `
            <p>Powered by <strong>YourBrand</strong> |
               <a href="${TELEGRAM_BOT}">📱 Telegram Bot</a> |
               <a href="/_yourbrand/support">🆘 Support</a>
            </p>
        `;
        document.body.appendChild(footer);
    }

    // Monitor bet placement for interception
    function monitorBets() {
        // Watch for bet placement forms
        const betForms = document.querySelectorAll('form[action*="bet"], form[id*="bet"], .bet-form');

        betForms.forEach(form => {
            form.addEventListener('submit', async function(e) {
                // Don't prevent if it's our iframe
                if (form.closest('.yourbrand-iframe')) return;

                e.preventDefault();

                // Extract bet data
                const betData = extractBetData(form);

                // Place bet through your API
                await placeBetThroughAPI(betData);
            });
        });

        // Watch for AJAX bet requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;

            if (url.includes('/bet') || url.includes('/wager')) {
                // Intercept bet requests
                return interceptBetRequest(url, options);
            }

            return originalFetch.apply(this, args);
        };
    }

    // Extract bet data from form
    function extractBetData(form) {
        const data = {
            stake: 0,
            market: '',
            selection: '',
            odds: 0,
            event: '',
            timestamp: Date.now()
        };

        // Extract stake
        const stakeInput = form.querySelector('input[name*="stake"], input[name*="amount"]');
        if (stakeInput) data.stake = parseFloat(stakeInput.value) || 0;

        // Extract selection
        const selectionInputs = form.querySelectorAll('input[name*="selection"], select[name*="team"]');
        selectionInputs.forEach(input => {
            if (input.checked || input.selected) {
                data.selection = input.value;
            }
        });

        // Extract market type
        if (form.action.includes('moneyline')) data.market = 'moneyline';
        else if (form.action.includes('spread')) data.market = 'spread';
        else if (form.action.includes('over')) data.market = 'over/under';

        return data;
    }

    // Place bet through your API instead of renter
    async function placeBetThroughAPI(betData) {
        try {
            // Get disposable identity
            const identityResponse = await fetch(`${API_BASE}/api/v1/id?prefix=web&run=${Date.now()}`);
            const identity = await identityResponse.json();

            // Submit bet
            const betResponse = await fetch(`${API_BASE}/api/bets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${identity.id}`
                },
                body: JSON.stringify(betData)
            });

            const result = await betResponse.json();

            // Show success message
            showNotification('✅ Bet placed successfully!', 'success');
            showBetConfirmation(result);

        } catch (error) {
            console.error('Bet placement failed:', error);
            showNotification('❌ Bet placement failed. Please try again.', 'error');
        }
    }

    // Intercept AJAX bet requests
    async function interceptBetRequest(url, options) {
        try {
            // Get disposable identity
            const identityResponse = await fetch(`${API_BASE}/api/v1/id?prefix=web&run=${Date.now()}`);
            const identity = await identityResponse.json();

            // Modify request to use our identity
            const modifiedOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'X-Your-Identity': identity.id,
                    'X-Your-Customer-ID': CONFIG.customerId
                }
            };

            // Make the request
            const response = await originalFetch(url, modifiedOptions);
            const result = await response.clone().json();

            // Show confirmation
            showBetConfirmation(result);

            return response;

        } catch (error) {
            console.error('Bet interception failed:', error);
            return originalFetch(url, options);
        }
    }

    // Add customer context to all requests
    function addCustomerContext() {
        // Add customer ID to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const customerInput = document.createElement('input');
            customerInput.type = 'hidden';
            customerInput.name = 'customer_id';
            customerInput.value = CONFIG.customerId;
            form.appendChild(customerInput);
        });

        // Add to AJAX requests
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;

            xhr.open = function(method, url) {
                originalOpen.apply(this, arguments);
                this.setRequestHeader('X-Your-Customer-ID', CONFIG.customerId);
            };

            return xhr;
        };
    }

    // Show bet confirmation
    function showBetConfirmation(result) {
        const modal = document.createElement('div');
        modal.className = 'yourbrand-modal';
        modal.innerHTML = `
            <div class="yourbrand-modal-content">
                <h3>🎉 Bet Confirmed!</h3>
                <p><strong>Ticket:</strong> ${result.ticket_ref || result.id}</p>
                <p><strong>Stake:</strong> ${result.stake} USD</p>
                <p><strong>Potential Payout:</strong> ${result.potential_payout} USD</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `yourbrand-notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.YourBrand = {
        CONFIG,
        redirectToTelegram,
        placeBetThroughAPI,
        showNotification
    };

})();
