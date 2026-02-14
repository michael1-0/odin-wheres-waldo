import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";

import waldoSrc from "../assets/character-icons/waldo.png";
import odlawSrc from "../assets/character-icons/odlaw.png";
import wizardSrc from "../assets/character-icons/wizard.png";
import mapSrc from "../assets/image-answers.png";
import { createPortal } from "react-dom";

interface Character {
  name: string;
  found: boolean;
  x: number;
  y: number;
}

function Play() {
  const [waldo, setWaldo] = useState<Character>({
    name: "waldo",
    found: false,
    x: 1585,
    y: 622,
  });
  const [odlaw, setOdlaw] = useState<Character>({
    name: "odlaw",
    found: false,
    x: 273,
    y: 585,
  });
  const [wizard, setWizard] = useState<Character>({
    name: "wizard",
    found: false,
    x: 695,
    y: 584,
  });
  const foundChars = [waldo, odlaw, wizard].filter((c) => c.found);

  const [targetBox, setTargetBox] = useState<{
    x: number;
    y: number;
    rangeX: Array<number>;
    rangeY: Array<number>;
  } | null>(null);
  const targetBoxSize = { width: 60, height: 60 };

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState<number>(0);
  const elapsedMillisecondsRef = useRef<number>(0);
  const timerStartRef = useRef<number | null>(null);
  useEffect(() => {
    elapsedMillisecondsRef.current = elapsedMilliseconds;
  }, [elapsedMilliseconds]);
  useEffect(() => {
    if (isOpenModal) return;

    if (timerStartRef.current === null) {
      timerStartRef.current = Date.now() - elapsedMillisecondsRef.current;
    }

    const intervalId = setInterval(() => {
      if (timerStartRef.current !== null) {
        setElapsedMilliseconds(Date.now() - timerStartRef.current);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [isOpenModal]);

  const [isWrongGuessToastVisible, setIsWrongGuessToastVisible] =
    useState<boolean>(false);
  useEffect(() => {
    if (!isWrongGuessToastVisible) return;

    const timeoutId = setTimeout(() => {
      setIsWrongGuessToastVisible(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isWrongGuessToastVisible]);
  const showWrongGuessToast = () => {
    setIsWrongGuessToastVisible(false);
    setTimeout(() => {
      setIsWrongGuessToastVisible(true);
    }, 0);
  };

  function formatElapsedTime(totalMilliseconds: number) {
    const totalCentiseconds = Math.floor(totalMilliseconds / 10);
    const minutes = Math.floor(totalCentiseconds / 6000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((totalCentiseconds % 6000) / 100)
      .toString()
      .padStart(2, "0");
    const centiseconds = (totalCentiseconds % 100).toString().padStart(2, "0");

    return `${minutes}:${seconds}.${centiseconds}`;
  }

  function resetGame() {
    setWaldo({ name: "waldo", found: false, x: 1585, y: 622 });
    setOdlaw({ name: "odlaw", found: false, x: 273, y: 600 });
    setWizard({ name: "wizard", found: false, x: 695, y: 584 });
    setTargetBox(null);
    timerStartRef.current = null;
    setElapsedMilliseconds(0);
    setIsOpenModal(false);
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-stretch">
      <div className="flex justify-center sticky top-0 z-99999">
        <Link to={"/"} className="text-center text-xl  bg-white p-4 flex-1">
          Back to Menu
        </Link>
      </div>
      <div className=" p-4 flex flex-col justify-center items-center mt-20 gap-10 pb-0">
        <div className="text-4xl">Find these guys:</div>
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col justify-center items-center w-1/8">
            <img
              src={waldoSrc}
              alt="character waldo"
              className="border-2 rounded-full"
            />
            <div className="text-xl">Waldo</div>
          </div>
          <div className="flex flex-col justify-center items-center w-1/8">
            <img
              src={odlawSrc}
              alt="character odlaw"
              className="border-2 rounded-full"
            />
            <div className="text-xl">Odlaw</div>
          </div>
          <div className="flex flex-col justify-center items-center w-1/8">
            <img
              src={wizardSrc}
              alt="character wizard"
              className="border-2 rounded-full"
            />
            <div className="text-xl">Wizard</div>
          </div>
        </div>
        <div className="w-fit overflow-x-auto overflow-y-hidden relative">
          <img
            src={mapSrc}
            onClick={(e) => {
              const rect = (
                e.currentTarget as HTMLImageElement
              ).getBoundingClientRect();

              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              const rangeX = [
                x - targetBoxSize.width * (1 / 2),
                x + targetBoxSize.width * (1 / 2),
              ];
              const rangeY = [
                y - targetBoxSize.height * (1 / 2),
                y + targetBoxSize.height * (1 / 2),
              ];

              setTargetBox({
                x,
                y,
                rangeX,
                rangeY,
              });
            }}
            alt="beach map"
            className="block min-w-fit cursor-crosshair"
          />
          {foundChars.map((c) => (
            <div
              key={c.name}
              className=" pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-green-400 text-4xl font-bold"
              style={{
                left: c.x,
                top: c.y,
              }}
            >
              ✓
            </div>
          ))}
          {targetBox && (
            <>
              <div
                className="pointer-events-none absolute border-2 border-red-600 bg-red-400/20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${targetBoxSize.width}px`,
                  height: `${targetBoxSize.height}px`,
                  left: `${targetBox.x}px`,
                  top: `${targetBox.y}px`,
                }}
              />
              <div
                className="absolute rounded-sm translate-x-1/3 -translate-y-1/2 bg-white z-9999 flex flex-col p-2 gap-4 "
                style={{
                  left: `${targetBox.x}px`,
                  top: `${targetBox.y}px`,
                }}
              >
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                  onClick={() => {
                    const isCorrect =
                      waldo.x >= targetBox.rangeX[0] &&
                      waldo.x <= targetBox.rangeX[1] &&
                      waldo.y >= targetBox.rangeY[0] &&
                      waldo.y <= targetBox.rangeY[1];

                    if (isCorrect) {
                      setWaldo({ ...waldo, found: true });
                      if (odlaw.found && wizard.found) setIsOpenModal(true);
                    } else {
                      showWrongGuessToast();
                    }
                    setTargetBox(null);
                  }}
                >
                  <div>Waldo</div>
                  <img
                    src={waldoSrc}
                    alt="character waldo"
                    className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                  />
                </div>
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                  onClick={() => {
                    const isCorrect =
                      odlaw.x >= targetBox.rangeX[0] &&
                      odlaw.x <= targetBox.rangeX[1] &&
                      odlaw.y >= targetBox.rangeY[0] &&
                      odlaw.y <= targetBox.rangeY[1];

                    if (isCorrect) {
                      setOdlaw({ ...odlaw, found: true });
                      if (waldo.found && wizard.found) setIsOpenModal(true);
                    } else {
                      showWrongGuessToast();
                    }
                    setTargetBox(null);
                  }}
                >
                  <div>Odlaw</div>
                  <img
                    src={odlawSrc}
                    alt="character odlaw"
                    className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                  />
                </div>
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                  onClick={() => {
                    const isCorrect =
                      wizard.x >= targetBox.rangeX[0] &&
                      wizard.x <= targetBox.rangeX[1] &&
                      wizard.y >= targetBox.rangeY[0] &&
                      wizard.y <= targetBox.rangeY[1];

                    if (isCorrect) {
                      setWizard({ ...wizard, found: true });
                      if (waldo.found && odlaw.found) setIsOpenModal(true);
                    } else {
                      showWrongGuessToast();
                    }
                    setTargetBox(null);
                  }}
                >
                  <div>Wizard</div>
                  <img
                    src={wizardSrc}
                    alt="character wizard"
                    className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {isOpenModal &&
          createPortal(
            <div className="fixed inset-0 z-99999 backdrop-blur-xl flex items-center justify-center">
              <form className=" bg-white flex flex-col items-stretch gap-4 p-5 rounded-sm shadow-md">
                <div className="text-2xl text-center">You have finished!</div>
                <div className="text-center text-3xl">
                  {formatElapsedTime(elapsedMilliseconds)}
                </div>
                <div className="flex flex-col gap-1">
                  <label>Name:</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="shadow-md p-2"
                  />
                </div>
                <div className="flex gap-2 h-10">
                  <button
                    type="submit"
                    className="flex-1 shadow-md rounded-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      resetGame();
                    }}
                  >
                    Submit
                  </button>
                  <button
                    className="flex-1 shadow-md rounded-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      resetGame();
                    }}
                  >
                    Restart
                  </button>
                </div>
              </form>
            </div>,
            document.body,
          )}
        {isWrongGuessToastVisible &&
          createPortal(
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-99999 rounded-sm bg-red-600 px-4 py-3 text-white shadow-md">
              Wrong guess. Try again.
            </div>,
            document.body,
          )}
        <div className="sticky bg-white bottom-0 text-4xl p-4 w-full text-center z-99999">
          {formatElapsedTime(elapsedMilliseconds)}
        </div>
      </div>
    </div>
  );
}

export default Play;
