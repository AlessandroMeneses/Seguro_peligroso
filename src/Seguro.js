import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star, AlertTriangle, Volume2, VolumeX } from "lucide-react";

// Import the sounds
import derrota from "./assets/sounds/derrota.mp3";
import victoria from "./assets/sounds/victoria.mp3";
import time from "./assets/sounds/time.mp3";
import winSound from "./assets/sounds/win.mp3";
import indicacionesSound from "./assets/sounds/indicaciones.mp3";

// Import the images
import par1 from "./assets/img/par1.webp";
import par2 from "./assets/img/par2.webp";
import par3 from "./assets/img/par3.webp";
import par4 from "./assets/img/par4.webp";
import par5 from "./assets/img/par5.webp";
import par6 from "./assets/img/par6.webp";
import par7 from "./assets/img/par7.webp";
import par8 from "./assets/img/par8.webp";
import par9 from "./assets/img/par9.webp";
import par10 from "./assets/img/par10.webp";

import par11 from "./assets/img/par11.webp";
import par22 from "./assets/img/par22.webp";
import par33 from "./assets/img/par33.webp";
import par44 from "./assets/img/par44.webp";
import par55 from "./assets/img/par55.webp";
import par66 from "./assets/img/par66.webp";
import par77 from "./assets/img/par77.webp";
import par88 from "./assets/img/par88.webp";
import par99 from "./assets/img/par99.webp";
import par1010 from "./assets/img/par1010.webp";

import car1 from "./assets/img/car1.webp";
import car2 from "./assets/img/car2.webp";
import car3 from "./assets/img/car3.webp";

import alejoImage from "./assets/img/alejo.webp";
import titleImage from "./assets/img/title.webp";

const messagesByImage = {
  0: "El adulto no va atento al joven",
  1: "No espera en semáforo rojo",
  2: "No respeta la señal",
  3: "No va atento a la vía",
  4: "Parquea donde no debe",
  5: "No respeta la señal",
  6: "No utiliza cruce peatonal",
  7: "Parquea donde no debe",
  8: "No espera en semáforo rojo",
  9: "No esta atento al semáforo"
};

const TitleComponent = () => (
  <div className="title-container">
    <img src={titleImage} alt="¿Seguro o Peligroso?" className="title-image" />
  </div>
);

const ColorfulLights = ({ visible }) => {
  // ... (ColorfulLights component code remains unchanged)
};

export default function GameComponent() {
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPair, setCurrentPair] = useState(0);
  const [timer, setTimer] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showLights, setShowLights] = useState(false);
  const timeAudioRef = useRef(new Audio(time));
  const [isAnimating, setIsAnimating] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [dangerousSelected, setDangerousSelected] = useState(false);
  const [safeSelected, setSafeSelected] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const [isIndicacionesMuted, setIsIndicacionesMuted] = useState(false);
  const gainNodeRef = useRef(null);

  const imagePairs = [
    { correct: par1, incorrect: par11 },
    { correct: par2, incorrect: par22 },
    { correct: par3, incorrect: par33 },
    { correct: par4, incorrect: par44 },
    { correct: par5, incorrect: par55 },
    { correct: par6, incorrect: par66 },
    { correct: par7, incorrect: par77 },
    { correct: par8, incorrect: par88 },
    { correct: par9, incorrect: par99 },
    { correct: par10, incorrect: par1010 }
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
    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    fetch(indicacionesSound)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        audioBufferRef.current = audioBuffer;
      })
      .catch(error => console.error("Error loading audio:", error));

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isIndicacionesMuted ? 0 : 1, audioContextRef.current.currentTime);
    }
  }, [isIndicacionesMuted]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 11) {
            timeAudioRef.current
              .play()
              .catch((error) => console.error("Error playing time audio:", error));
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
    if (!gameStarted || isAnimating || (safeSelected && shuffledImages[currentPair][index] !== imagePairs[currentPair].correct)) {
      return;
    }

    const isCorrect = shuffledImages[currentPair][index] === imagePairs[currentPair].correct;

    setSelectedContainer(index);
    
    if (isCorrect) {
      const audio = new Audio(victoria);
      audio.play().catch((error) => console.error("Error playing victoria audio:", error));
      setSafeSelected(true);
      setDangerousSelected(false);
      setWarningMessage("");
      setRotatingIndex(null);
      setScore((prevScore) => prevScore + 10);
    } else {
      const audio = new Audio(derrota);
      audio.play().catch((error) => console.error("Error playing derrota audio:", error));
      
      setIsSpinning(true);
      setIsAnimating(true);
      setRotatingIndex(index);
      setWarningMessage(messagesByImage[currentPair]);
      setDangerousSelected(true);
      
      setTimeout(() => {
        setIsSpinning(false);
        setIsAnimating(false);
        setRotatingIndex(null);
      }, 2000);
    }
  };

  const handleNextClick = () => {
    if (currentPair < 9) {
      setCurrentPair((prev) => prev + 1);
      setSelectedContainer(null);
      setWarningMessage("");
      setDangerousSelected(false);
      setSafeSelected(false);
      setRotatingIndex(null);
    } else {
      setIsGameCompleted(true);
      setIsTimerRunning(false);
      setGameStarted(false);

      const allCorrect = shuffledImages.every((pair, index) =>
        pair.includes(imagePairs[index].correct)
      );

      if (allCorrect) {
        const audio = new Audio(winSound);
        audio.play().catch((error) => console.error("Error playing win audio:", error));

        setShowLights(true);
        setTimeout(() => {
          setShowLights(false);
        }, 5000);
      }

      timeAudioRef.current.pause();
      timeAudioRef.current.currentTime = 0;
    }
  };

  const handleRestart = () => {
    setSelectedContainer(null);
    setIsSpinning(false);
    setCurrentPair(0);
    setTimer(120);
    setIsTimerRunning(false);
    setIsGameCompleted(false);
    setIsGameLost(false);
    setShuffledImages(shuffleImages());
    setGameStarted(false);
    setScore(0);
    setShowLights(false);
    setWarningMessage("");
    setDangerousSelected(false);
    setSafeSelected(false);
    setRotatingIndex(null);
    timeAudioRef.current.pause();
    timeAudioRef.current.currentTime = 0;
  };

  const handleStartGame = () => {
    setIsTimerRunning(true);
    setGameStarted(true);
  };

  const playIndicacionesSound = () => {
    if (audioContextRef.current && audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(gainNodeRef.current);
      source.start();
    }
  };

  const toggleIndicacionesMute = () => {
    setIsIndicacionesMuted(prevState => !prevState);
  };

  return (
    <>
      <TitleComponent />
      <div className="app-container">
        <div className="indicaciones-container">
          <button className="indicaciones" onClick={playIndicacionesSound}>Indicaciones</button>
          <button className="mute-button" onClick={toggleIndicacionesMute}>
            {isIndicacionesMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
        <ColorfulLights visible={showLights} />
        {warningMessage && (
          <div className="mess">
            <AlertTriangle className="warning-icon inline-block mr-2" />
            &nbsp;
            {warningMessage}
          </div>
        )}
        <div className="content">
          <div className="top-bar">
            {!isGameCompleted && !isGameLost && (
              <>
                <div className="timer">
                  Tiempo: <span className="timer-digits">{timer} S</span>
                </div>
                &nbsp; &nbsp;
                <div className="score">
                  Puntuación: <span className="score-digits">{score}</span>
                  &nbsp;
                </div>
              </>
            )}
          </div>
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
                      } ${
                        safeSelected &&
                        image !== imagePairs[currentPair].correct
                          ? "disabled"
                          : ""
                      }`}
                      whileHover={
                        !isAnimating && !safeSelected ? { scale: 1.05 } : {}
                      }
                      animate={
                        rotatingIndex === index
                          ? {
                              rotateY: [0, 360],
                              transition: {
                                duration: 1,
                                ease: "easeInOut",
                                repeat: 2,
                              },
                            }
                          : {}
                      }
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
                Has completado el juego en {120 - timer} segundos.
              </p>
              <p>Puntuación final: {score}</p>
              <div className="button-container">
                <button className="restart-button" onClick={handleRestart}>
                  Volver a empezar
                </button>
                <button className="home-button">Ir a inicio</button>
              </div>
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
                {currentPair === 9 ? "Finalizar" : "Siguiente"}
              </button>
              <button className="restart-button" onClick={handleRestart}>
                Volver a empezar
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
      <div className="car car1">
        <img src={car1} alt="Car 1" />
      </div>

      <div className="car car2">
        <img src={car2} alt="Car 2" />
      </div>

      <div className="car car3">
        <img src={car3} alt="Car 3" />
      </div>
      <img src={alejoImage} alt="Alejo" className="alejo-image" />
    </>
  );
}