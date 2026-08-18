const CONFIG = {
    gravity: 0.08,
    baseDrag: 0.995,
    aeroDragMultiplier: 0.001, // Higher = less drag per level
    liftMultiplier: 0.04,
    throwPower: 4.0,
    throwPop: 1.5,
    rocketThrust: 0.2,
    rocketLift: 0.05,
    moneyMultiplier: 0.2 // Earned money = (alt + dist) * this
};

const UPGRADES = {
    throw: { level: 1, cost: 50, name: "Throw Power", desc: "Increase initial throw speed" },
    aero:  { level: 1, cost: 100, name: "Aerodynamics", desc: "Reduces air drag" },
    fuel:  { level: 0, cost: 250, name: "Rocket Booster", desc: "Adds fuel. Hold F to boost" },
    bounce:{ level: 0, cost: 500, name: "Bounce Pads", desc: "Bounce off the ground once" }
};
