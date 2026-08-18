const CONFIG = {
    gravity: 0.12,        // Increased to make space harder
    baseDrag: 0.995,
    aeroDragMultiplier: 0.002,
    liftMultiplier: 0.05,
    throwPower: 5.0,
    throwPop: 2.0,
    rocketThrust: 0.3,
    rocketLift: 0.1,
    moneyMultiplier: 0.25,
    mapLength: 50000     // Extended map length
};

// Planet Milestones & Unlocks
const PLANETS = [
    { name: "The Atmosphere", altitude: 1000, unlocks: null, desc: "You reached the upper atmosphere!" },
    { name: "The Moon", altitude: 3500, unlocks: "fuel2", desc: "Reached the Moon! Ion Thrusters Unlocked." },
    { name: "Mars", altitude: 8000, unlocks: "aero2", desc: "Reached Mars! Vacuum Aerodynamics Unlocked." },
    { name: "Jupiter", altitude: 15000, unlocks: "throw2", desc: "Reached Jupiter! Railgun Launch Unlocked." }
];

const UPGRADES = {
    throw:  { level: 1, cost: 50, name: "Throw Power", desc: "Increase initial throw speed", maxLevel: 10 },
    aero:   { level: 1, cost: 100, name: "Aerodynamics", desc: "Reduces air drag", maxLevel: 10 },
    fuel:   { level: 0, cost: 250, name: "Rocket Booster", desc: "Adds fuel. Hold F to boost", maxLevel: 10 },
    bounce: { level: 0, cost: 500, name: "Bounce Pads", desc: "Bounce off the ground once", maxLevel: 5 },
    
    // Tier 2 Unlocks
    throw2: { level: 0, cost: 5000, name: "Railgun Launch", desc: "Massive starting speed", maxLevel: 5, locked: true },
    aero2:  { level: 0, cost: 3000, name: "Vacuum Aero", desc: "Near zero drag in space", maxLevel: 5, locked: true },
    fuel2:  { level: 0, cost: 2000, name: "Ion Thruster", desc: "High efficiency, low thrust", maxLevel: 5, locked: true }
};
