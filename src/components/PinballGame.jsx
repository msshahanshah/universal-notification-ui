import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import useSound from "use-sound";

/**
 * CONFIG — Easy to tweak game behavior from here
 */
const CONFIG = {
  width: 400,
  height: 600,
  gravity: 0.5, // Reduced gravity for better gameplay
  ballRadius: 12,
  bumperScore: 50,
  wallRestitution: 0.7, // More realistic bounce
  flipperTorque: 0.2, // Better control for flippers
  ballSpeed: 10, // Initial ball speed
};

export default function PinballGame() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [playBumper] = useSound("/sounds/bumper.mp3", { volume: 0.5 });
  const [playFlipper] = useSound("/sounds/flipper.mp3");
  const [playLoseLife] = useSound("/sounds/lose.mp3");

  useEffect(() => {
    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Events,
      Body,
      Constraint,
    } = Matter;

    /** ---------------- ENGINE SETUP ---------------- */
    const engine = Engine.create();
    engine.world.gravity.y = CONFIG.gravity;
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: CONFIG.width,
        height: CONFIG.height,
        wireframes: false,
        background: "#0f172a", // gaming dark theme
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    /** ---------------- BALL ---------------- */
    const ball = Bodies.circle(CONFIG.width / 2, 100, CONFIG.ballRadius, {
      restitution: 0.9,
      render: {
        fillStyle: "#facc15",
        sprite: {
          // texture: "/images/bumper.png",
          xScale: 0.1,
          yScale: 0.1,
        },
      }, // yellow ball
    });

    /** ---------------- WALLS ---------------- */
    const walls = [
      Bodies.rectangle(CONFIG.width / 2, 0, CONFIG.width, 20, {
        isStatic: true,
        restitution: CONFIG.wallRestitution,
      }),
      Bodies.rectangle(CONFIG.width / 2, CONFIG.height, CONFIG.width, 20, {
        isStatic: true,
      }),
      Bodies.rectangle(0, CONFIG.height / 2, 20, CONFIG.height, {
        isStatic: true,
      }),
      Bodies.rectangle(CONFIG.width, CONFIG.height / 2, 20, CONFIG.height, {
        isStatic: true,
      }),
    ];

    /** ---------------- BUMPERS ---------------- */
    const bumpers = [
      createBumper(150, 250),
      createBumper(250, 300),
      createBumper(200, 350),
    ];

    function createBumper(x, y) {
      return Bodies.circle(x, y, 20, {
        isStatic: true,
        restitution: 1.2,
        render: { fillStyle: "#22d3ee" }, // neon bumper
      });
    }

    /** ---------------- FLIPPERS ---------------- */
    const leftFlipper = Bodies.trapezoid(120, 500, 80, 15, 0.3, {
      isStatic: true,
      angle: -0.3,
      render: { fillStyle: "#ef4444" },
      friction: 0.01,
      restitution: 0.8,
      chamfer: { radius: 5 }
    });

    const rightFlipper = Bodies.trapezoid(280, 500, 80, 15, -0.3, {
      isStatic: true,
      angle: 0.3,
      render: { fillStyle: "#ef4444" },
      friction: 0.01,
      restitution: 0.8,
      chamfer: { radius: 5 }
    });

    // Flippers pivot constraints with better physics
    const leftPivot = { x: 100, y: 500 };
    const rightPivot = { x: 300, y: 500 };

    const leftConstraint = Constraint.create({
      pointA: leftPivot,
      bodyB: leftFlipper,
      pointB: { x: -40, y: 0 },
      stiffness: 1,
      render: { visible: false }
    });

    const rightConstraint = Constraint.create({
      pointA: rightPivot,
      bodyB: rightFlipper,
      pointB: { x: 40, y: 0 },
      stiffness: 1,
      render: { visible: false }
    });

    Composite.add(engine.world, [
      ball,
      ...walls,
      ...bumpers,
      leftFlipper,
      rightFlipper,
      leftConstraint,
      rightConstraint,
    ]);

    function spawnParticles(position) {
      const particles = Array.from({ length: 8 }).map(() =>
        Bodies.circle(position.x, position.y, 3, {
          restitution: 0.9,
          render: { fillStyle: "#f97316" },
        }),
      );

      Composite.add(engine.world, particles);

      // remove after 500ms
      setTimeout(() => {
        particles.forEach((p) => Composite.remove(engine.world, p));
      }, 500);
    }

    /** ---------------- SCORING SYSTEM ---------------- */
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (bumpers.includes(pair.bodyA) || bumpers.includes(pair.bodyB)) {
          setScore((prev) => prev + CONFIG.bumperScore);
        }
      });
    });

    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (bumpers.includes(pair.bodyA) || bumpers.includes(pair.bodyB)) {
          setScore((prev) => prev + CONFIG.bumperScore);
          playBumper(); // 🔊 hit sound
          spawnParticles(pair.collision.supports[0]); // 💥 particles
        }
      });
    });

    Events.on(engine, "afterUpdate", () => {
      if (ball.position.y > CONFIG.height - 30) {
        setLives((l) => l - 1);
        playLoseLife();
        Body.setPosition(ball, { x: CONFIG.width / 2, y: 100 });
        Body.setVelocity(ball, { x: 0, y: 0 });
      }
    });

    /** ---------------- CONTROLS ---------------- */
    const handleKeyDown = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        Body.setAngularVelocity(leftFlipper, -0.5);
        Body.setAngle(leftFlipper, -0.5);
        playFlipper();
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        Body.setAngularVelocity(rightFlipper, 0.5);
        Body.setAngle(rightFlipper, 0.5);
        playFlipper();
      }
      // Space to launch ball
      if (e.code === "Space") {
        const force = { x: (Math.random() - 0.5) * 0.1, y: -CONFIG.ballSpeed };
        Body.setVelocity(ball, force);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        Body.setAngularVelocity(leftFlipper, 0.3);
        Body.setAngle(leftFlipper, 0);
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        Body.setAngularVelocity(rightFlipper, -0.3);
        Body.setAngle(rightFlipper, 0);
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Initial ball launch
    setTimeout(() => {
      const force = { x: (Math.random() - 0.5) * 0.1, y: -CONFIG.ballSpeed };
      Body.setVelocity(ball, force);
    }, 1000);

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (render.canvas) {
        render.canvas.remove();
      }
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [lives]);

  // Game over effect
  useEffect(() => {
    if (lives <= 0) {
      alert(`Game Over! Final Score: ${score}`);
      // Reset game
      setLives(3);
      setScore(0);
    }
  }, [lives, score]);

  return (
    <div className="flex flex-col items-center text-white">
      <h2 className="text-2xl font-bold mb-2">🎯 Pinball Arena</h2>
      <div ref={sceneRef} />
      <p>❤️ Lives: {lives}</p>
      <p className="mt-4 text-lg">Score: {score}</p>
    </div>
  );
}
