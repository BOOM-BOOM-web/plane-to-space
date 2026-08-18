const StorageManager = {
    saveKey: 'paperToSpaceSaveData_v1',

    save(money, upgrades) {
        try {
            const data = {
                money: money,
                upgrades: upgrades
            };
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            console.error("Save failed:", e);
        }
    },

    load() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (e) {
            console.error("Load failed:", e);
        }
        return null;
    },

    clear() {
        try {
            localStorage.removeItem(this.saveKey);
        } catch (e) {
            console.error("Clear failed:", e);
        }
    }
};
