import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star } from "lucide-react";
import "./Seguro.css";

// Import the sounds
import derrota from "./assets/sounds/derrota.mp3";
import victoria from "./assets/sounds/victoria.mp3";
import time from "./assets/sounds/time.mp3";
import winSound from "./assets/sounds/win.mp3";

// Import the images
import imagen1 from "./assets/img/imagen1.jpg";
import imagen2 from "./assets/img/imagen2.jpg";
import imagen3 from "./assets/img/imagen3.jpg";
import imagen4 from "./assets/img/imagen4.jpg";
import imagen5 from "./assets/img/imagen5.jpg";
import imagen6 from "./assets/img/imagen6.jpg";
import alejoImage from "./assets/img/alejo.png";
import titleImage from "./assets/img/title.png";

// Componente actualizado para las luces coloridas
const ColorfulLights = ({ visible }) => {
  const totalDuration = 5000;
  const visibleDuration = 1500;
  const numberOfLights = 10;

  const lights = Array.from({ length: numberOfLights }, (_, i) => ({
    id: i,
    show: false,
  }));

  const [animatedLights, setAnimatedLights] = useState(lights);

  useEffect(() => {
    if (visible) {
      const intervalBetweenLights = totalDuration / numberOfLights;

      const timeouts = animatedLights.map((_, index) => {
        return setTimeout(() => {
          setAnimatedLights((prev) =>
            prev.map((light, i) =>
              i === index ? { ...light, show: true } : light
            )
          );

          setTimeout(() => {
            setAnimatedLights((prev) =>
              prev.map((light, i) =>
                i === index ? { ...light, show: false } : light
              )
            );
          }, visibleDuration);
        }, index * intervalBetweenLights);
      });

      const resetTimeout = setTimeout(() => {
        setAnimatedLights(lights);
      }, totalDuration);

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
        clearTimeout(resetTimeout);
      };
    }
  }, [visible]);

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="colorful-lights">
      {animatedLights.map((light) => (
        <motion.div
          key={light.id}
          className="light"
          initial={{ opacity: 0 }}
          animate={{
            opacity: light.show ? 1 : 0,
            scale: light.show ? 1 : 0.5,
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          style={{
            backgroundColor: getRandomColor(),
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: "50px",
            height: "50px",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export default function GameComponent() {
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPair, setCurrentPair] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [level, setLevel] = useState(1);
  const [isGameLost, setIsGameLost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showLights, setShowLights] = useState(false);
  const timeAudioRef = useRef(new Audio(time));
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAlejoMessage, setShowAlejoMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  const alejoMessages = [
    "¡Cuidado! Esa opción es peligrosa",
    "¡Recuerda las señales de tránsito!",
    "¡Esa no es la opción segura!",
    "¡Piensa en tu seguridad!",
    "¡Mantén siempre la precaución!",
  ];

  const imagePairs = [
    { correct: imagen2, incorrect: imagen1 },
    { correct: imagen4, incorrect: imagen3 },
    { correct: imagen6, incorrect: imagen5 },
  ];

  const shuffleImages = () => {
    return imagePairs.map((pair) =>
      Math.random() < 0.5
        ? [pair.correct, pair.incorrect]
        : [pair.incorrect, pair.correct]
    );
  };

  const [shuffledImages, setShuffledImages] = useState(shuffleImages());

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 11) {
            timeAudioRef.current
              .play()
              .catch((error) =>
                console.error("Error playing time audio:", error)
              );
          }
          if (prevTimer === 1) {
            setIsTimerRunning(false);
            setIsGameLost(true);
            timeAudioRef.current.pause();
            timeAudioRef.current.currentTime = 0;
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      timeAudioRef.current.pause();
      timeAudioRef.current.currentTime = 0;
    };
  }, [isTimerRunning, timer]);

  const handleContainerClick = (index) => {
    if (!gameStarted || isAnimating) return;
    const isCorrect =
      shuffledImages[currentPair][index] === imagePairs[currentPair].correct;
    setSelectedContainer(index);

    if (isCorrect) {
      const audio = new Audio(victoria);
      audio
        .play()
        .catch((error) =>
          console.error("Error playing victoria audio:", error)
        );
    } else {
      const audio = new Audio(derrota);
      audio
        .play()
        .catch((error) => console.error("Error playing derrota audio:", error));

      // Mostrar mensaje de Alejo
      setCurrentMessage(
        alejoMessages[Math.floor(Math.random() * alejoMessages.length)]
      );
      setShowAlejoMessage(true);

      // Ocultar mensaje después de 10 segundos
      setTimeout(() => {
        setShowAlejoMessage(false);
      }, 10000);

      setIsSpinning(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsSpinning(false);
        setIsAnimating(false);
      }, 1800);
    }
  };

  const handleNextClick = () => {
    if (currentPair < 2) {
      setCurrentPair((prev) => prev + 1);
      setSelectedContainer(null);
    } else {
      setIsGameCompleted(true);
      setIsTimerRunning(false);
      setGameStarted(false);
      calculateScore();

      const allCorrect = shuffledImages.every((pair, index) =>
        pair.includes(imagePairs[index].correct)
      );

      if (allCorrect) {
        const audio = new Audio(winSound);
        audio
          .play()
          .catch((error) => console.error("Error playing win audio:", error));

        setShowLights(true);
        setTimeout(() => {
          setShowLights(false);
        }, 5000);
      }

      timeAudioRef.current.pause();
      timeAudioRef.current.currentTime = 0;
    }
  };

  const calculateScore = () => {
    const maxTime = level === 1 ? 30 : level === 2 ? 20 : 10;
    const timeLeft = timer;
    const maxScore = level === 1 ? 100 : level === 2 ? 500 : 1000;
    const calculatedScore = Math.round((timeLeft / maxTime) * maxScore);
    setScore(calculatedScore);
  };

  const handleRestart = () => {
    setSelectedContainer(null);
    setIsSpinning(false);
    setCurrentPair(0);
    setTimer(level === 1 ? 30 : level === 2 ? 20 : 10);
    setIsTimerRunning(false);
    setIsGameCompleted(false);
    setIsGameLost(false);
    setShuffledImages(shuffleImages());
    setGameStarted(false);
    setScore(0);
    setShowLights(false);
    setShowAlejoMessage(false);
    timeAudioRef.current.pause();
    timeAudioRef.current.currentTime = 0;
  };

  const handleLevelChange = (newLevel) => {
    if (!gameStarted && !isGameCompleted) {
      setLevel(newLevel);
      setTimer(newLevel === 1 ? 30 : newLevel === 2 ? 20 : 10);
    }
  };

  const handleStartGame = () => {
    setIsTimerRunning(true);
    setGameStarted(true);
  };

  const containerHoverAnimation = {
    scale: 1.05,
    transition: { duration: 0.2 },
  };

  return (
    <>
      <div className="title-image-container">
        <img src={titleImage} alt="Game Title" className="title-image" />
      </div>
      <div className="app-container">
        <div className="top-bar">
          {!isGameCompleted && !isGameLost && (
            <>
              <div className="timer">
                Tiempo: <span className="timer-digits">{timer} S</span>
              </div>
              <div className="score">
                Puntuación: <span className="score-digits">{score}</span>
              </div>
            </>
          )}
          <div className="level-selector">
            <label htmlFor="level-select">Nivel: </label>
            <select
              id="level-select"
              value={level}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              disabled={gameStarted || isGameCompleted}
              className={gameStarted || isGameCompleted ? "disabled" : ""}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
        <div className="content">
          {!isGameCompleted && !isGameLost ? (
            <div className="game-area">
              <div className="containers">
                {shuffledImages[currentPair] &&
                  shuffledImages[currentPair].map((image, index) => (
                    <motion.div
                      key={index}
                      className={`container ${
                        selectedContainer === index
                          ? image === imagePairs[currentPair].correct
                            ? "selected-correct"
                            : "selected-incorrect"
                          : ""
                      }`}
                      whileHover={!isAnimating ? containerHoverAnimation : {}}
                      animate={
                        isSpinning &&
                        selectedContainer === index &&
                        image !== imagePairs[currentPair].correct
                          ? { rotateY: [0, 720] }
                          : {}
                      }
                      transition={{ duration: 1.2, ease: "linear" }}
                      onClick={() => handleContainerClick(index)}
                    >
                      <img src={image} alt="Imagen" />
                      {selectedContainer === index && (
                        <motion.div
                          className={`feedback ${
                            image === imagePairs[currentPair].correct
                              ? "correct"
                              : "incorrect"
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.1 }}
                        >
                          {image === imagePairs[currentPair].correct ? (
                            <CheckCircle className="icon" />
                          ) : (
                            <XCircle className="icon" />
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          ) : isGameLost ? (
            <div className="completion-message">
              <h2 className="perdiste">¡Perdiste!</h2>
              <p>Se acabó el tiempo. Vuelve a intentarlo.</p>
              <p>Puntuación final: {score}</p>
              <button className="restart-button" onClick={handleRestart}>
                Volver a empezar
              </button>
            </div>
          ) : (
            <div className="completion-message">
              <h2>¡Felicitaciones!</h2>
              <Star className="star-icon" />
              <p>
                Has completado el juego en{" "}
                {(level === 1 ? 30 : level === 2 ? 20 : 10) - timer} segundos.
              </p>
              <p>Puntuación final: {score}</p>
              <div className="button-container">
                <button className="restart-button" onClick={handleRestart}>
                  Volver a empezar
                </button>
                <button className="home-button">Ir a inicio</button>
              </div>
              <ColorfulLights visible={showLights} />
            </div>
          )}

          {!isGameCompleted && !isGameLost && gameStarted && (
            <div className="start">
              <button
                className="start-button"
                onClick={handleNextClick}
                disabled={
                  selectedContainer === null ||
                  shuffledImages[currentPair][selectedContainer] !==
                    imagePairs[currentPair].correct
                }
              >
                {currentPair === 2 ? "Finalizar" : "Siguiente"}
              </button>
            </div>
          )}

          {!gameStarted && !isGameCompleted && !isGameLost && (
            <div className="start">
              <button className="start-button" onClick={handleStartGame}>
                Comenzar
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAlejoMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: "500px",
              left: "150px",
              backgroundColor: "rgba(255, 255, 200, 0.95)",
              padding: "15px 20px",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              maxWidth: "250px",
              zIndex: 1100,
              border: "2px solid #ffc107",
              fontWeight: "bold",
              color: "#856404",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
              transform: "translateY(-50%)",
              backdropFilter: "blur(5px)",
            }}
          >
            {currentMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="car car1">
        <div className="wheel left"></div>
        <div className="wheel right"></div>
      </div>

      <div className="car car2">
        <div className="wheel left"></div>
        <div className="wheel right"></div>
      </div>

      <div className="car car3">
        <div className="wheel left"></div>
        <div className="wheel right"></div>
      </div>

      <img src={alejoImage} alt="Alejo" className="alejo-image" />
    </>
  );
}
