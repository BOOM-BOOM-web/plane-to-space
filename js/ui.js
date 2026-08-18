const UIManager = {
    elements: {},

    init() {
        this.elements = {
            altitude: document.getElementById('altitude'),
            distance: document.getElementById('distance'),
            money: document.getElementById('money'),
            runAlt: document.getElementById('run-alt'),
            runDist: document.getElementById('run-dist'),
            runMoney: document.getElementById('run-money'),
            totalMoney: document.getElementById('total-money'),
            fuelBarContainer: document.getElementById('fuel-bar-container'),
            fuelBar: document.getElementById('fuel-bar'),
            shopScreen: document.getElementById('shop-screen'),
            upgradesGrid: document.getElementById('upgrades-grid'),
            continueBtn: document.getElementById('continue-btn'),
            planetToast: document.getElementById('planet-toast'),
            fpsValue: document.getElementById('fps-value')
        };
        this.elements.continueBtn.onclick = () => GameManager.startFlight();
    },

    updateHUD(alt, dist, money) {
        this.elements.altitude.innerText = Math.floor(alt);
        this.elements.distance.innerText = Math.floor(dist);
        this.elements.money.innerText = money;
    },

    updateFPS(fps) {
        this.elements.fpsValue.innerText = fps;
    },

    updateFuelBar(fuel, maxFuel) {
        this.elements.fuelBar.style.width = (fuel / maxFuel * 100) + '%';
    },

    toggleFuelBar(show) {
        this.elements.fuelBarContainer.style.display = show ? 'block' : 'none';
    },

    showShop() { this.elements.shopScreen.style.display = 'flex'; },
    hideShop() { this.elements.shopScreen.style.display = 'none'; },

    showPlanetToast(text) {
        this.elements.planetToast.innerHTML = text;
        this.elements.planetToast.style.opacity = '1';
        setTimeout(() => { this.elements.planetToast.style.opacity = '0'; }, 4000);
    },

    buildShopUI(money) {
        this.elements.totalMoney.innerText = money;
        this.elements.upgradesGrid.innerHTML = '';
        
        for(let key in UPGRADES) {
            let up = UPGRADES[key];
            let isLocked = up.locked === true;
            let canAfford = money >= up.cost && !isLocked;
            
            let card = document.createElement('div');
            card.className = 'upgrade-card' + (canAfford ? '' : (isLocked ? ' locked' : ' disabled'));
            
            let costHTML = isLocked ? `<div class="upgrade-cost" style="color:#888">LOCKED</div>` : `<div class="upgrade-cost">$${up.cost}</div>`;
            
            card.innerHTML = `
                <div class="upgrade-info">
                    <h3>${up.name} (Lvl ${up.level})</h3>
                    <p>${up.desc}</p>
                </div>
                ${costHTML}
            `;
            
            if(canAfford) {
                card.onclick = () => GameManager.buyUpgrade(key);
            }
            this.elements.upgradesGrid.appendChild(card);
        }
    },

    updateRunStats(alt, dist, earned, totalMoney) {
        this.elements.runAlt.innerText = Math.floor(alt);
        this.elements.runDist.innerText = Math.floor(dist);
        this.elements.runMoney.innerText = earned;
        this.elements.totalMoney.innerText = totalMoney;
    }
};
