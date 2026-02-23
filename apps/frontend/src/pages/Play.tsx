import { Link, useNavigate } from "react-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";

import waldoSrc from "../assets/character-icons/waldo.png";
import odlawSrc from "../assets/character-icons/odlaw.png";
import wizardSrc from "../assets/character-icons/wizard.png";
import mapSrc from "../assets/image.webp";
import { createPortal } from "react-dom";

interface Character {
  name: string;
  found: boolean;
  x?: number;
  y?: number;
}

interface GameStartResponse {
  sessionToken: string;
  startedAtMs: number;
  serverNowMs: number;
}

function Play() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWithLoading = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      setIsLoading(true);

      try {
        return await fetch(input, init);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const [waldo, setWaldo] = useState<Character | null>({
    name: "waldo",
    found: false,
  });
  const [odlaw, setOdlaw] = useState<Character | null>({
    name: "odlaw",
    found: false,
  });
  const [wizard, setWizard] = useState<Character | null>({
    name: "wizard",
    found: false,
  });

  const foundChars = [waldo, odlaw, wizard].filter(
    (c): c is Character => c !== null && c.found,
  );

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState<number>(0);
  const elapsedMillisecondsRef = useRef<number>(0);
  const timerStartRef = useRef<number | null>(null);

  const getInitialElapsedMilliseconds = useCallback(
    (data: GameStartResponse) => {
      return Math.max(0, data.serverNowMs - data.startedAtMs);
    },
    [],
  );

  const warmBackend = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}`);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const startGameSession = useCallback(
    (options?: { resetState?: boolean }) => {
      const shouldResetState = options?.resetState ?? true;

      if (shouldResetState) {
        setIsSessionReady(false);
        timerStartRef.current = null;
        setElapsedMilliseconds(0);
        elapsedMillisecondsRef.current = 0;
      }

      setIsLoading(true);

      warmBackend()
        .then(() => fetch(`${import.meta.env.VITE_API_URL}game-start`))
        .then((response) => response.json())
        .then((data: GameStartResponse) => {
          const initialElapsedMilliseconds =
            getInitialElapsedMilliseconds(data);

          setToken(data.sessionToken);
          setElapsedMilliseconds(initialElapsedMilliseconds);
          elapsedMillisecondsRef.current = initialElapsedMilliseconds;
          timerStartRef.current = Date.now() - initialElapsedMilliseconds;
          setIsSessionReady(true);
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    },
    [getInitialElapsedMilliseconds, warmBackend],
  );

  useEffect(() => {
    elapsedMillisecondsRef.current = elapsedMilliseconds;
  }, [elapsedMilliseconds]);
  useEffect(() => {
    if (isOpenModal || !isSessionReady) return;

    if (timerStartRef.current === null) {
      timerStartRef.current = Date.now() - elapsedMillisecondsRef.current;
    }

    const intervalId = setInterval(() => {
      if (timerStartRef.current !== null) {
        setElapsedMilliseconds(Date.now() - timerStartRef.current);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [isOpenModal, isSessionReady]);

  useEffect(() => {
    startGameSession({ resetState: true });
  }, [startGameSession]);

  useEffect(() => {
    if (!isLoading) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isLoading]);

  const [targetBox, setTargetBox] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const targetBoxSize = { width: 60, height: 60 };

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

  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

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
    setWaldo({ name: "waldo", found: false });
    setOdlaw({ name: "odlaw", found: false });
    setWizard({ name: "wizard", found: false });
    setUsername("");
    setMessage("");
    setSubmitError("");
    setTargetBox(null);
    setIsOpenModal(false);
    startGameSession();
  }

  function handleUsernameChange(
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
    setSubmitError("");
    setUsername(e.target.value);
  }
  function handleMessageChange(
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
    setSubmitError("");
    setMessage(e.target.value);
  }

  function handleGameEndSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const data = JSON.stringify({
      playerName: username,
      sessionToken: token,
      message: message,
    });

    fetchWithLoading(`${import.meta.env.VITE_API_URL}game-end`, {
      body: data,
      method: "post",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof responseData?.error === "string"
              ? responseData.error
              : "Failed to submit score.";

          if (response.status === 409) {
            setSubmitError(errorMessage);
            return;
          }

          throw new Error(errorMessage);
        }

        navigate("/leaderboard");
      })
      .catch((error) => {
        setSubmitError(error.message ?? "Failed to submit score.");
      });
  }

  function handleWaldoSubmissionClick() {
    if (!targetBox) return;

    const data = JSON.stringify({
      sessionToken: token,
      characterName: waldo?.name,
      x: targetBox.x,
      y: targetBox.y,
    });

    fetchWithLoading(`${import.meta.env.VITE_API_URL}game-guess`, {
      method: "post",
      body: data,
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.allFound) {
          setToken(data.sessionToken);
          setIsOpenModal(true);
          return;
        }

        if (data.isCorrect) {
          setWaldo({
            name: "waldo",
            found: true,
            x: targetBox.x,
            y: targetBox.y,
          });
          setToken(data.sessionToken);
        } else {
          showWrongGuessToast();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setTargetBox(null));
  }

  function handleOdlawSubmissionClick() {
    if (!targetBox) return;

    const data = JSON.stringify({
      sessionToken: token,
      characterName: odlaw?.name,
      x: targetBox.x,
      y: targetBox.y,
    });

    fetchWithLoading(`${import.meta.env.VITE_API_URL}game-guess`, {
      method: "post",
      body: data,
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.allFound) {
          setToken(data.sessionToken);
          setIsOpenModal(true);
          return;
        }
        if (data.isCorrect) {
          setOdlaw({
            name: "odlaw",
            found: true,
            x: targetBox.x,
            y: targetBox.y,
          });
          setToken(data.sessionToken);
        } else {
          showWrongGuessToast();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setTargetBox(null));
  }

  function handleWizardSubmissionClick() {
    if (!targetBox) return;

    const data = JSON.stringify({
      sessionToken: token,
      characterName: wizard?.name,
      x: targetBox.x,
      y: targetBox.y,
    });

    fetchWithLoading(`${import.meta.env.VITE_API_URL}game-guess`, {
      method: "post",
      body: data,
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.allFound) {
          setToken(data.sessionToken);
          setIsOpenModal(true);
          return;
        }

        if (data.isCorrect) {
          setWizard({
            name: "wizard",
            found: true,
            x: targetBox.x,
            y: targetBox.y,
          });
          setToken(data.sessionToken);
        } else {
          showWrongGuessToast();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setTargetBox(null));
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-stretch">
      <div className="flex justify-center sticky top-0 z-99999">
        <Link to={"/"} className="text-center text-xl  bg-white p-4 flex-1">
          Back to Menu
        </Link>
      </div>
      <div className=" p-4 flex flex-col justify-center items-center mt-20 gap-10 pb-0">
        <div className="text-4xl text-center">Find these guys:</div>
        <div className="flex w-full max-w-md justify-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <img
              src={waldoSrc}
              alt="character waldo"
              className="w-full max-w-20 border-2 rounded-full"
            />
            <div className="text-lg sm:text-xl">Waldo</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <img
              src={odlawSrc}
              alt="character odlaw"
              className="w-full max-w-20 border-2 rounded-full"
            />
            <div className="text-lg sm:text-xl">Odlaw</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <img
              src={wizardSrc}
              alt="character wizard"
              className="w-full max-w-20 border-2 rounded-full"
            />
            <div className="text-lg sm:text-xl">Wizard</div>
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

              setTargetBox({
                x,
                y,
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
                {waldo && !waldo.found && (
                  <>
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                      onClick={handleWaldoSubmissionClick}
                    >
                      <div>Waldo</div>
                      <img
                        src={waldoSrc}
                        alt="character waldo"
                        className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                      />
                    </div>
                  </>
                )}
                {odlaw && !odlaw.found && (
                  <>
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                      onClick={handleOdlawSubmissionClick}
                    >
                      <div>Odlaw</div>
                      <img
                        src={odlawSrc}
                        alt="character odlaw"
                        className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                      />
                    </div>
                  </>
                )}
                {wizard && !wizard.found && (
                  <>
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-1 rounded-sm gap-2"
                      onClick={handleWizardSubmissionClick}
                    >
                      <div>Wizard</div>
                      <img
                        src={wizardSrc}
                        alt="character wizard"
                        className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10"
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {isOpenModal &&
          createPortal(
            <div className="fixed inset-0 z-99999 backdrop-blur-xl flex items-center justify-center">
              <form
                className=" bg-white flex flex-col items-stretch gap-4 p-5 rounded-sm shadow-md"
                onSubmit={(e) => handleGameEndSubmit(e)}
              >
                <div className="text-2xl text-center">You have finished!</div>
                <div className="flex flex-col gap-1">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="shadow-md p-2"
                    placeholder="Super cool username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Message to the world:</label>
                  <input
                    type="text"
                    className="shadow-md p-2"
                    placeholder="Message to the world"
                    value={message}
                    onChange={(e) => handleMessageChange(e)}
                  />
                </div>
                <div className="flex gap-2 h-10">
                  <button type="submit" className="flex-1 shadow-md rounded-sm">
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
                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}
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
        {isLoading &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center z-99999">
              <div className="px-6 py-4 text-3xl bg-white rounded-sm shadow-lg">
                Loading...
              </div>
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
